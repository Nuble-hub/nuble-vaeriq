import type { PaymentIntent } from "../domain/index.js";

export type ExecutionAttemptState =
  | "STARTED"
  | "SUBMITTED"
  | "CONFIRMED"
  | "FAILED_BEFORE_SUBMISSION"
  | "UNKNOWN_AFTER_SUBMISSION"
  | "RECONCILED";

export type ExecutionAttempt = {
  id: string;
  intentId: string;
  idempotencyKey: string;
  state: ExecutionAttemptState;
  txHash?: string;
  error?: string;
  startedAt: string;
  updatedAt: string;
};

export interface ExecutionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ExecutionAttemptStore {
  list(intentId?: string): ExecutionAttempt[];
  latest(intentId: string): ExecutionAttempt | null;
  append(attempt: ExecutionAttempt): void;
  replace(attempt: ExecutionAttempt): void;
  clear(): void;
}

export class JsonExecutionAttemptStore implements ExecutionAttemptStore {
  constructor(
    private readonly storage: ExecutionStorage,
    private readonly key = "vaeriq:execution:v1"
  ) {}

  list(intentId?: string): ExecutionAttempt[] {
    const attempts = this.read();
    return intentId ? attempts.filter((attempt) => attempt.intentId === intentId) : attempts;
  }

  latest(intentId: string): ExecutionAttempt | null {
    const attempts = this.list(intentId);
    return attempts[attempts.length - 1] ?? null;
  }

  append(attempt: ExecutionAttempt): void {
    const attempts = this.read();
    if (attempts.some((item) => item.id === attempt.id)) {
      throw new Error("EXECUTION_ATTEMPT_ALREADY_EXISTS");
    }
    this.storage.setItem(this.key, JSON.stringify([...attempts, attempt]));
  }

  replace(attempt: ExecutionAttempt): void {
    const attempts = this.read();
    const index = attempts.findIndex((item) => item.id === attempt.id);
    if (index < 0) throw new Error("EXECUTION_ATTEMPT_NOT_FOUND");
    const next = attempts.slice();
    next[index] = attempt;
    this.storage.setItem(this.key, JSON.stringify(next));
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }

  private read(): ExecutionAttempt[] {
    const raw = this.storage.getItem(this.key);
    if (!raw) return [];

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isExecutionAttempt);
    } catch {
      return [];
    }
  }
}

export function createExecutionAttempt(intent: PaymentIntent, now = new Date().toISOString()): ExecutionAttempt {
  const id = `ea_${crypto.randomUUID()}`;
  return {
    id,
    intentId: intent.id,
    idempotencyKey: `intent:${intent.id}`,
    state: "STARTED",
    startedAt: now,
    updatedAt: now
  };
}

export function canStartExecution(attempt: ExecutionAttempt | null): boolean {
  return attempt === null || attempt.state === "FAILED_BEFORE_SUBMISSION";
}

export function nextExecutionAttemptState(
  attempt: ExecutionAttempt,
  state: ExecutionAttemptState,
  args: { now?: string; txHash?: string; error?: string } = {}
): ExecutionAttempt {
  const now = args.now ?? new Date().toISOString();
  const next: ExecutionAttempt = {
    ...attempt,
    state,
    updatedAt: now
  };

  if (args.txHash !== undefined) next.txHash = args.txHash;
  if (args.error !== undefined) next.error = args.error;

  return next;
}

export function isRetryableExecutionState(state: ExecutionAttemptState): boolean {
  return state === "FAILED_BEFORE_SUBMISSION";
}

function isExecutionAttempt(value: unknown): value is ExecutionAttempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Record<string, unknown>;

  return (
    typeof attempt.id === "string" &&
    typeof attempt.intentId === "string" &&
    typeof attempt.idempotencyKey === "string" &&
    typeof attempt.state === "string" &&
    ["STARTED", "SUBMITTED", "CONFIRMED", "FAILED_BEFORE_SUBMISSION", "UNKNOWN_AFTER_SUBMISSION", "RECONCILED"].includes(attempt.state) &&
    typeof attempt.startedAt === "string" &&
    typeof attempt.updatedAt === "string" &&
    (attempt.txHash === undefined || typeof attempt.txHash === "string") &&
    (attempt.error === undefined || typeof attempt.error === "string")
  );
}
