import type { AuditEvent } from "../domain/index.js";

export interface AuditStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AuditEventStore {
  append(events: readonly AuditEvent[]): void;
  list(limit?: number): AuditEvent[];
  clear(): void;
}

export class JsonAuditEventStore implements AuditEventStore {
  constructor(
    private readonly storage: AuditStorage,
    private readonly key = "vaeriq:audit:v1"
  ) {}

  append(events: readonly AuditEvent[]): void {
    if (!events.length) return;
    const current = this.read();
    const next = [...current, ...events];
    this.storage.setItem(this.key, JSON.stringify(next));
  }

  list(limit = 100): AuditEvent[] {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("INVALID_AUDIT_LIMIT");
    }
    const events = this.read();
    return events.slice(Math.max(0, events.length - limit));
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }

  private read(): AuditEvent[] {
    const raw = this.storage.getItem(this.key);
    if (!raw) return [];

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isAuditEvent);
    } catch {
      return [];
    }
  }
}

function isAuditEvent(value: unknown): value is AuditEvent {
  if (!value || typeof value !== "object") return false;

  const event = value as Record<string, unknown>;
  return (
    typeof event.id === "string" &&
    typeof event.type === "string" &&
    typeof event.actor === "string" &&
    typeof event.intentId === "string" &&
    typeof event.organizationId === "string" &&
    typeof event.timestamp === "string"
  );
}
