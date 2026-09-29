import { address, createClient } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";
import { evaluatePayment } from "../../../packages/evaluation/index.js";
import { authorizeExecution } from "../../../packages/decision/execution-guard.js";
import { createExecutionAuditEvents, createExecutionFailureAuditEvent, createExecutionUnknownAuditEvent, createTransactionReconciliationAuditEvent, createAuditEvent } from "../../../packages/audit/index.js";
import { JsonAuditEventStore } from "../../../packages/audit/store.js";
import type { AuditEvent } from "../../../packages/domain/index.js";
import { reconcilePaymentTransaction, type TransactionReconciliation } from "../../../packages/reconciliation/index.js";
import { JsonExecutionAttemptStore, canStartExecution, createExecutionAttempt, nextExecutionAttemptState, type ExecutionAttempt } from "../../../packages/execution/index.js";
import { SolanaAdapter, SOLANA_DEVNET_RPC, SOLANA_DEVNET_USDC_MINT } from "../../../adapters/solana/index.js";
import type { ApprovedIntent, PaymentContext, PaymentIntent, PolicySet } from "../../../packages/domain/index.js";
import "./styles.css";

const DEMO_DESTINATION = "HQVxiMVDoV9jzG4tpoxmDZsNfWvaHXm8DGGv93Gka75v";
const BLOCK_DESTINATION = "11111111111111111111111111111111";
const USDC_DECIMALS = 6;

const client = createClient()
  .use(walletSigner({ chain: "solana:devnet" }))
  .use(solanaRpc({ rpcUrl: SOLANA_DEVNET_RPC }));

const auditStore = new JsonAuditEventStore(window.localStorage);
const executionStore = new JsonExecutionAttemptStore(window.localStorage);

const state = {
  mode: "APPROVE" as "APPROVE" | "BLOCK" | "UNKNOWN",
  intent: null as PaymentIntent | null,
  result: null as ReturnType<typeof evaluatePayment> | null,
  txSignature: "",
  auditEvents: [] as AuditEvent[],
  reconciliation: null as TransactionReconciliation | null,
  executionAttempt: null as ExecutionAttempt | null,
  decision: null as "APPROVE" | "REVIEW" | "BLOCK" | null,
  persistedLatestIntentId: "",
  lastReconciledTxSignature: "",
  error: "",
  guideOpen: localStorage.getItem("vaeriq:demo:guide:v1") !== "closed"
};

function parseUsdcAtomic(value: string): string {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,6})?$/.test(normalized)) throw new Error("INVALID_USDC_AMOUNT");
  const [whole, fraction = ""] = normalized.split(".");
  const atomic = BigInt(whole) * 1_000_000n + BigInt((fraction + "000000").slice(0, USDC_DECIMALS));
  if (atomic <= 0n) throw new Error("INVALID_USDC_AMOUNT");
  return atomic.toString();
}

function policyFor(mode: typeof state.mode, recipient: string): PolicySet {
  const approvedDestination = mode === "BLOCK" ? DEMO_DESTINATION : recipient;
  return {
    id: "policy_demo_m01",
    version: 1,
    active: true,
    defaultEffect: "ALLOW",
    rules: [
      { id: "asset-usdc-only", type: "ASSET", operator: "IN", value: ["USDC"], effect: "ALLOW", message: "USDC is approved." },
      { id: "destination-allowlist", type: "DESTINATION", operator: "NOT_IN", value: [approvedDestination], effect: "BLOCK", message: "Destination is outside the approved treasury allowlist." },
      { id: "large-agent-review", type: "AMOUNT", operator: "GT", value: "5000000000", effect: "REVIEW", message: "Agent payments above 5,000 USDC require treasury review." }
    ]
  };
}

function contextFor(mode: typeof state.mode): PaymentContext {
  const known = mode === "BLOCK" ? [DEMO_DESTINATION] : [state.intent?.recipient ?? DEMO_DESTINATION];
  return {
    knownDestinations: known,
    knownCounterparties: ["vendor_demo"],
    approvedAssets: ["USDC"],
    historicalMedianAtomic: "2000000000",
    recentIntents: [],
    invoiceRequiredAboveAtomic: "1000000000",
    agentSinglePaymentLimitAtomic: "5000000000",
    agentDailyLimitAtomic: "20000000000",
    agentSpentTodayAtomic: "1000000000",
    evidence: state.intent?.invoiceRef
      ? [{ id: `invoice:${state.intent.invoiceRef}`, type: "INVOICE", summary: `Invoice ${state.intent.invoiceRef} is attached.` }]
      : []
  };
}

function buildIntent(): PaymentIntent {
  const recipientInput = (document.querySelector<HTMLInputElement>("#recipient")?.value ?? "").trim();
  const amountUsdc = (document.querySelector<HTMLInputElement>("#amount")?.value ?? "12").trim();
  const invoiceRef = (document.querySelector<HTMLInputElement>("#invoice")?.value ?? "INV-001").trim();
  const connected = client.wallet.getState().connected;
  if (!connected) throw new Error("CONNECT_WALLET_FIRST");
  if (!recipientInput) throw new Error("RECIPIENT_REQUIRED");
  address(recipientInput);

  return {
    id: `pi_${crypto.randomUUID()}`,
    organizationId: "demo_org",
    requesterType: "human",
    requesterId: connected.account.address,
    recipient: recipientInput,
    asset: "USDC",
    amountAtomic: parseUsdcAtomic(amountUsdc),
    amountDisplay: amountUsdc,
    purpose: "Hackathon milestone payment",
    counterpartyId: "vendor_demo",
    invoiceRef: invoiceRef || undefined,
    chain: "solana",
    status: "SUBMITTED",
    createdAt: new Date().toISOString()
  };
}

function restoreLatestAuditState(): void {
  const events = auditStore.list(200);
  if (!events.length) return;

  const latestIntentId = events[events.length - 1]?.intentId;
  if (!latestIntentId) return;

  state.persistedLatestIntentId = latestIntentId;
  state.lastReconciledTxSignature = findLastReconciledSignature(events.filter((event) => event.intentId === latestIntentId));
  state.executionAttempt = executionStore.latest(latestIntentId);
  if (state.executionAttempt?.state === "UNKNOWN_AFTER_SUBMISSION") state.mode = "UNKNOWN";
  else if (state.executionAttempt?.state === "FAILED_BEFORE_SUBMISSION") state.mode = "APPROVE";

  const latestEvents = events.filter((event) => event.intentId === latestIntentId);
  state.auditEvents = latestEvents;

  const decisionEvent = [...latestEvents].reverse().find((event) => event.type === "DECISION_MADE");
  if (decisionEvent?.payloadRef?.startsWith("decision:")) {
    const value = decisionEvent.payloadRef.slice("decision:".length);
    if (value === "APPROVE" || value === "REVIEW" || value === "BLOCK") state.decision = value;
  }

  const transactionEvent = [...latestEvents].reverse().find(
    (event) => event.type === "TRANSACTION_CONFIRMED" || event.type === "TRANSACTION_SUBMITTED"
  );
  const transactionRef = transactionEvent?.payloadRef?.startsWith("tx:")
    ? transactionEvent.payloadRef.slice("tx:".length)
    : undefined;

  const reconciliationEvent = [...latestEvents].reverse().find((event) => event.type === "TRANSACTION_RECONCILED");
  const reconciliationRef = reconciliationEvent?.payloadRef;
  const reconciliationMatch = reconciliationRef?.match(/^reconciliation:(MATCHED|MISMATCHED|NOT_FOUND):tx:(.+)$/);

  if (reconciliationMatch) {
    state.reconciliation = {
      status: reconciliationMatch[1] as TransactionReconciliation["status"],
      transaction: null,
      mismatches: []
    };
    state.txSignature = transactionRef ?? reconciliationMatch[2];
  } else if (transactionRef) {
    state.txSignature = transactionRef;
  }

  const failureEvent = [...latestEvents].reverse().find((event) => event.type === "EXECUTION_FAILED");
  const unknownEvent = [...latestEvents].reverse().find((event) => event.type === "EXECUTION_UNKNOWN");
  const terminalErrorEvent = failureEvent ?? unknownEvent;
  if (terminalErrorEvent?.payloadRef?.startsWith("error:")) {
    state.error = terminalErrorEvent.payloadRef.slice("error:".length);
  }
}

function findLastReconciledSignature(events: AuditEvent[]): string {
  const event = [...events].reverse().find((item) => item.type === "TRANSACTION_RECONCILED");
  const match = event?.payloadRef?.match(/^reconciliation:(?:MATCHED|MISMATCHED|NOT_FOUND):tx:(.+)$/);
  return match?.[1] ?? "";
}

function render() {
  const walletState = client.wallet.getState();
  const connected = walletState.connected;
  const wallets = walletState.wallets;
  const walletStatus = walletState.status;
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const decision = state.result?.result.decision ?? state.decision;
  const reasons = state.result?.result.reasons ?? [];
  const contextSnapshot = state.result?.contextSnapshot ?? null;
  const contextCompleteness = state.result?.contextCompleteness ?? null;
  const contextEvidenceRefs = contextSnapshot?.evidenceRefs ?? [];
  const signature = state.txSignature;
  const auditEvents = state.auditEvents;
  const reconciliation = state.reconciliation;
  const executionAttempt = state.executionAttempt;
  const executionState = executionAttempt?.state ?? "IDLE";
  const executionLocked = executionAttempt ? !canStartExecution(executionAttempt) : false;
  const canExecute = Boolean(state.intent && state.result && decision === "APPROVE" && !executionLocked);
  const executeLabel = executionState === "FAILED_BEFORE_SUBMISSION"
    ? "Retry approved payment"
    : executionState === "UNKNOWN_AFTER_SUBMISSION"
      ? "Execution outcome uncertain"
      : executionState === "CONFIRMED" || executionState === "RECONCILED"
        ? "Payment execution complete"
        : state.mode === "UNKNOWN"
          ? "Simulate execution uncertainty"
          : "Execute approved payment";

  const guideMarkup = state.guideOpen ? [
    "      <section class=\"guide-card card\" aria-label=\"VAERIQ demo guide\">",
    "        <div class=\"guide-top\">",
    "          <div>",
    "            <div class=\"card-title\">Quick start</div>",
    "            <h2>New to VAERIQ? Start here.</h2>",
    "            <p class=\"guide-lead\">This demo shows how a payment is checked before value is allowed to move. You do not need Treasury expertise to follow the flow.</p>",
    "          </div>",
    "          <button class=\"guide-close\" id=\"guide-close\">Hide guide</button>",
    "        </div>",
    "        <div class=\"guide-steps\">",
    "          <article class=\"guide-step\"><span class=\"guide-step-number\">01</span><div><strong>Connect a Solana Devnet wallet</strong><p>The wallet identifies the requester and becomes the signer. Signing only happens after an explicit APPROVE.</p></div></article>",
    `          <article class="guide-step"><span class="guide-step-number">02</span><div><strong>Choose a scenario, then Evaluate</strong><p>Start with <b>Adversarial · BLOCK</b> to see VAERIQ stop a payment that violates the demo control policy.</p><button class="guide-action" id="guide-start-block">${walletState.connected ? "Start with BLOCK scenario" : "Connect wallet to start BLOCK"}</button></div></article>`,
    "          <article class=\"guide-step\"><span class=\"guide-step-number\">03</span><div><strong>Read the decision evidence</strong><p>Follow <b>Intent → Context → Policy / Risk → Decision</b>. Only APPROVE can continue to the execution boundary.</p></div></article>",
    "        </div>",
    "        <div class=\"guide-scenarios\">",
    "          <div class=\"guide-section-label\">What each scenario demonstrates</div>",
    "          <div class=\"guide-scenario-grid\">",
    "            <div class=\"guide-scenario\"><b>APPROVE</b><span>A compliant payment with complete business context.</span></div>",
    "            <div class=\"guide-scenario\"><b>BLOCK</b><span>A payment outside the approved control boundary.</span></div>",
    "            <div class=\"guide-scenario\"><b>UNKNOWN</b><span>How VAERIQ handles uncertain execution without automatic retry.</span></div>",
    "          </div>",
    "        </div>",
    "        <details class=\"guide-glossary\">",
    "          <summary>Small glossary — no Treasury background required</summary>",
    "          <div class=\"glossary-grid\">",
    "            <div><b>Intent</b><span>What the requester is trying to pay for.</span></div>",
    "            <div><b>Context</b><span>Business information and evidence supporting the payment.</span></div>",
    "            <div><b>Policy</b><span>Deterministic rules that decide what is allowed.</span></div>",
    "            <div><b>Risk</b><span>Signals that can require additional review.</span></div>",
    "            <div><b>Reconciliation</b><span>Checking that the blockchain transaction matches the intended payment.</span></div>",
    "            <div><b>Audit</b><span>The evidence trail showing what VAERIQ decided and what happened.</span></div>",
    "          </div>",
    "        </details>",
    "      </section>"
  ].join("\n") : "";

  const connectInProgress = walletStatus === "pending" || walletStatus === "connecting" || walletStatus === "reconnecting";
  const connectLabel = connectInProgress ? "Connecting…" : `Connect wallet${wallets[0] ? ` · ${wallets[0].name}` : ""}`;

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div>
          <div class="eyebrow">NUBLE / VAERIQ</div>
          <h1>Control before value moves.</h1>
          <p class="sub">M03 · Solana Devnet · Intent + context + evidence</p>
        </div>
        <div class="wallet-box">
          <span>${connected ? `Connected · ${connected.account.address.slice(0, 4)}…${connected.account.address.slice(-4)}` : "Wallet not connected"}</span>
          <button class="guide-nav" id="guide-toggle" aria-expanded="${state.guideOpen}">Guide</button>
          <a class="feedback-nav" href="./feedback.html">Feedback ↗</a>
          ${connected ? "" : `<button id="connect" ${connectInProgress || walletStatus !== "disconnected" ? "disabled" : ""}>${connectLabel}</button>`}
        </div>
      </header>

      ${guideMarkup}

      <section class="grid">
        <div class="card">
          <div class="card-title">Payment Intent</div>
          <label>Scenario</label>
          <div class="scenario-row">
            <button class="mode ${state.mode === "APPROVE" ? "active" : ""}" id="approve-mode">Compliant · APPROVE</button>
            <button class="mode ${state.mode === "BLOCK" ? "active" : ""}" id="block-mode">Adversarial · BLOCK</button>
            <button class="mode ${state.mode === "UNKNOWN" ? "active" : ""}" id="unknown-mode">Recovery · UNKNOWN</button>
          </div>

          <label for="recipient">Recipient</label>
          <input id="recipient" value="${state.intent?.recipient ?? (state.mode === "BLOCK" ? BLOCK_DESTINATION : DEMO_DESTINATION)}" />

          <div class="two-col">
            <div>
              <label for="amount">Amount (USDC)</label>
              <input id="amount" value="${state.intent?.amountDisplay ?? (state.mode === "BLOCK" ? "8500" : "12")}" inputmode="decimal" />
            </div>
            <div>
              <label for="invoice">Invoice ref</label>
              <input id="invoice" value="${state.intent ? (state.intent.invoiceRef ?? "") : (state.mode === "BLOCK" ? "" : "INV-001")}" />
            </div>
          </div>

          <button class="primary" id="evaluate">Evaluate payment</button>
          <p class="hint">The decision is deterministic. The connected wallet is only asked to sign after an explicit APPROVE.</p>
          ${state.mode === "UNKNOWN" ? `<p class="recovery-note">Demo-only recovery scenario: execution uncertainty is simulated after the execution boundary. No transaction is intentionally submitted by this scenario.</p>` : ""}
        </div>

        <div class="card decision-card">
          <div class="card-title">Decision Engine</div>
          <div class="pipeline">
            <span>Intent</span><b>→</b><span>Policy</span><b>→</b><span>Risk</span><b>→</b><strong class="decision ${(decision ?? "idle").toLowerCase()}">${decision ?? "WAITING"}</strong>
          </div>
          <div class="reason-box">
            ${reasons.length ? reasons.map((x) => `<div>• ${x}</div>`).join("") : `<div class="muted">Run an evaluation to see the control evidence.</div>`}
          </div>
          <button class="execute" id="execute" ${canExecute ? "" : "disabled"}>${executeLabel}</button>
          <div class="execution-status ${executionState.toLowerCase()}"><span>Execution state</span><strong>${executionState}</strong></div>
          ${executionAttempt ? `<div class="execution-meta">Attempt <code>${executionAttempt.id}</code><br/>Idempotency key <code>${executionAttempt.idempotencyKey}</code></div>` : ""}
          ${executionState === "FAILED_BEFORE_SUBMISSION" ? `<div class="recovery-note">Retry is allowed because failure was recorded before transaction submission.</div>` : ""}
          ${executionState === "UNKNOWN_AFTER_SUBMISSION" ? `<div class="recovery-warning">Execution outcome is uncertain. VAERIQ blocks an automatic retry to avoid duplicate payment.</div>` : ""}
          ${state.error ? `<div class="error">${state.error}</div>` : ""}
          ${signature ? `<div class="success">Executed · ${signature.slice(0, 12)}…</div><a href="https://explorer.solana.com/tx/${signature}?cluster=devnet" target="_blank" rel="noreferrer">View Devnet transaction ↗</a>` : ""}
        </div>
      </section>

      <section class="context-panel card">
        <div class="context-heading">
          <div>
            <div class="card-title">Why should this payment move?</div>
            <h2>Intent · Context · Evidence</h2>
          </div>
          ${contextCompleteness ? `<strong class="context-status ${contextCompleteness.status.toLowerCase()}">${contextCompleteness.status}</strong>` : ""}
        </div>

        ${contextSnapshot ? `
          <div class="context-grid">
            <div class="context-item"><span>Purpose</span><strong>${contextSnapshot.purpose || "—"}</strong></div>
            <div class="context-item"><span>Counterparty</span><strong>${contextSnapshot.counterpartyId || "—"}</strong></div>
            <div class="context-item"><span>Invoice</span><strong>${contextSnapshot.invoiceRef || "—"}</strong></div>
            <div class="context-item"><span>Destination</span><strong>${contextSnapshot.destinationKnown ? "Known destination" : "New destination"}</strong></div>
            <div class="context-item"><span>Counterparty context</span><strong>${contextSnapshot.counterpartyKnown ? "Known counterparty" : "Unknown counterparty"}</strong></div>
            <div class="context-item"><span>Asset</span><strong>${contextSnapshot.assetApproved ? "Approved asset" : "Unapproved asset"}</strong></div>
          </div>

          <div class="context-evidence">
            <div class="context-label">Evidence references</div>
            ${contextEvidenceRefs.length
              ? contextEvidenceRefs.map((ref) => `<div class="evidence-row"><code>${ref}</code></div>`).join("")
              : `<div class="muted">No evidence references attached.</div>`}
          </div>

          ${contextCompleteness?.status === "INCOMPLETE"
            ? `<div class="context-warning">Missing context: ${contextCompleteness.missing.join(", ")}.${decision === "REVIEW" ? " The incomplete context changed the decision to REVIEW." : ""}</div>`
            : `<div class="context-note">This context snapshot is bound to the current PaymentIntent and is evaluated before execution.</div>`}
        ` : `<div class="muted context-empty">Run an evaluation to see the business context and evidence attached to this payment intent.</div>`}
      </section>

      <section class="audit card">
        <div class="card-title">Audit Trail</div>
        <div class="audit-row"><span>Network</span><strong>Solana Devnet</strong></div>
        <div class="audit-row"><span>USDC mint</span><code>${SOLANA_DEVNET_USDC_MINT}</code></div>
        <div class="audit-row"><span>Latest persisted intent</span><code>${state.intent?.id ?? state.persistedLatestIntentId ?? "—"}</code></div>
        <div class="audit-row"><span>Decision</span><strong>${decision ?? "—"}</strong></div>
        <div class="audit-row"><span>Execution state</span><strong class="execution-state-cell ${executionState.toLowerCase()}">${executionState}</strong></div>
        <div class="audit-row"><span>Execution attempt</span><code>${executionAttempt?.id ?? "—"}</code></div>
        <div class="audit-row"><span>Transaction signature</span><code>${signature || "—"}</code></div>
        <div class="audit-row"><span>Last reconciled transaction</span><code>${state.lastReconciledTxSignature || "—"}</code></div>
        <div class="audit-row"><span>Reconciliation</span><strong class="recon ${reconciliation?.status?.toLowerCase() ?? "idle"}">${reconciliation?.status ?? "—"}</strong></div>
        <div class="audit-row"><span>Audit events</span><code>${auditEvents.length ? auditEvents.map((event) => `${event.type}:${event.payloadRef ?? ""}`).join(" · ") : "—"}</code></div>
        <div class="card-title recent-title">Recent persisted events</div>
        <div class="recent-events">
          ${auditStore.list(10).slice().reverse().map((event) => `<div class="recent-event"><strong>${event.type}</strong><span>${event.intentId}</span><code>${event.payloadRef ?? ""}</code></div>`).join("") || `<div class="muted">No persisted audit events yet.</div>`}
        </div>
      </section>

      <section class="feedback-cta card">
        <div>
          <div class="card-title">Public beta</div>
          <h2>Tell us what matched your workflow.</h2>
          <p class="hint">General product feedback goes to the research form. Technical issues can be opened as a structured GitHub issue.</p>
        </div>
        <a class="feedback-cta-link" href="./feedback.html">Open feedback center ↗</a>
      </section>
    </main>
  `;

  document.querySelector<HTMLButtonElement>("#connect")?.addEventListener("click", async () => {
    state.error = "";
    const current = client.wallet.getState();

    // walletSigner may auto-connect in the browser. Do not start a second
    // connection while discovery/reconnect is already in flight.
    if (current.connected) {
      render();
      return;
    }

    if (current.status !== "disconnected") {
      render();
      return;
    }

    try {
      const available = current.wallets;
      if (!available.length) throw new Error("NO_WALLET_FOUND");
      await client.wallet.connect(available[0]);
      state.error = "";
    } catch (error) {
      // A concurrent auto-connect can win the race and still leave the wallet
      // connected. Treat that state as success rather than surfacing a false
      // error such as "superseded by a newer connect or sign-in".
      if (client.wallet.getState().connected) {
        state.error = "";
      } else {
        state.error = error instanceof Error ? error.message : "WALLET_CONNECT_FAILED";
      }
    }
    render();
  });

  document.querySelector<HTMLButtonElement>("#guide-toggle")?.addEventListener("click", () => {
    state.guideOpen = !state.guideOpen;
    localStorage.setItem("vaeriq:demo:guide:v1", state.guideOpen ? "open" : "closed");
    render();
  });

  document.querySelector<HTMLButtonElement>("#guide-close")?.addEventListener("click", () => {
    state.guideOpen = false;
    localStorage.setItem("vaeriq:demo:guide:v1", "closed");
    render();
  });

  document.querySelector<HTMLButtonElement>("#guide-start-block")?.addEventListener("click", () => {
    state.mode = "BLOCK";
    localStorage.setItem("vaeriq:demo:mode:v1", "BLOCK");

    const walletState = client.wallet.getState();
    if (!walletState.connected) {
      document.querySelector<HTMLButtonElement>("#connect")?.click();
      return;
    }

    document.querySelector<HTMLButtonElement>("#block-mode")?.click();
    document.querySelector<HTMLInputElement>("#recipient")?.focus();
  });
  document.querySelector("#approve-mode")?.addEventListener("click", () => { state.mode = "APPROVE"; localStorage.setItem("vaeriq:demo:mode:v1", "APPROVE"); state.intent = null; state.result = null; state.txSignature = ""; state.auditEvents = []; state.reconciliation = null; state.executionAttempt = null; state.decision = null; state.persistedLatestIntentId = ""; state.lastReconciledTxSignature = ""; state.error = ""; render(); });
  document.querySelector("#block-mode")?.addEventListener("click", () => { state.mode = "BLOCK"; localStorage.setItem("vaeriq:demo:mode:v1", "BLOCK"); state.intent = null; state.result = null; state.txSignature = ""; state.auditEvents = []; state.reconciliation = null; state.executionAttempt = null; state.decision = null; state.persistedLatestIntentId = ""; state.lastReconciledTxSignature = ""; state.error = ""; render(); });
  document.querySelector("#unknown-mode")?.addEventListener("click", () => { state.mode = "UNKNOWN"; localStorage.setItem("vaeriq:demo:mode:v1", "UNKNOWN"); state.intent = null; state.result = null; state.txSignature = ""; state.auditEvents = []; state.reconciliation = null; state.executionAttempt = null; state.decision = null; state.persistedLatestIntentId = ""; state.lastReconciledTxSignature = ""; state.error = ""; render(); });

  document.querySelector<HTMLButtonElement>("#evaluate")?.addEventListener("click", () => {
    state.error = "";
    localStorage.setItem("vaeriq:demo:mode:v1", state.mode);
    state.txSignature = "";
    state.auditEvents = [];
    state.reconciliation = null;
    state.executionAttempt = null;
    state.decision = null;
    try {
      const intent = buildIntent();
      state.intent = intent;
      state.result = evaluatePayment({ intent, policy: policyFor(state.mode, intent.recipient), context: contextFor(state.mode) });
      state.decision = state.result.result.decision;
      state.auditEvents = state.result.auditEvents;
      auditStore.append(state.result.auditEvents);
      render();
    } catch (error) {
      state.error = error instanceof Error ? error.message : "EVALUATION_FAILED";
      render();
    }
  });

  document.querySelector<HTMLButtonElement>("#execute")?.addEventListener("click", async () => {
    state.error = "";
    let approvedIntent: ApprovedIntent | null = null;
    let executionStarted = false;
    let adapterExecutionEntered = false;

    try {
      if (!state.result || !state.intent) throw new Error("EVALUATE_FIRST");
      if (state.result.result.decision !== "APPROVE") throw new Error(`EXECUTION_NOT_AUTHORIZED:${state.result.result.decision}`);
      if (state.executionAttempt && !canStartExecution(state.executionAttempt)) {
        throw new Error(`EXECUTION_NOT_AUTHORIZED:EXECUTION_ATTEMPT_NOT_RETRYABLE:${state.executionAttempt.state}`);
      }

      approvedIntent = authorizeExecution(state.intent, state.result.result);
      const attempt = createExecutionAttempt(approvedIntent);
      executionStore.append(attempt);
      state.executionAttempt = attempt;

      const started = createAuditEvent({
        id: `${approvedIntent.id}:execution-started:${attempt.id}`,
        type: "EXECUTION_STARTED",
        actor: approvedIntent.requesterId,
        intentId: approvedIntent.id,
        organizationId: approvedIntent.organizationId,
        payloadRef: `execution:${attempt.id}`
      });
      executionStarted = true;
      state.auditEvents = [...state.auditEvents, started];
      auditStore.append([started]);
      render();

      const connectedSigner = client.wallet.getState().connected?.signer;
      if (!connectedSigner) throw new Error("WALLET_SIGNER_NOT_AVAILABLE");
      const adapter = new SolanaAdapter({}, connectedSigner);
      const simulation = await adapter.simulateIntent(approvedIntent);
      if (!simulation.ok) throw new Error(simulation.message);

      adapterExecutionEntered = true;
      if (state.mode === "UNKNOWN") {
        throw new Error("SIMULATED_POST_SUBMISSION_UNCERTAINTY");
      }
      const result = await adapter.execute(approvedIntent);

      state.txSignature = result.txHash;
      const submitted = nextExecutionAttemptState(attempt, "SUBMITTED", { txHash: result.txHash });
      executionStore.replace(submitted);
      state.executionAttempt = submitted;

      const confirmed = nextExecutionAttemptState(submitted, result.confirmed ? "CONFIRMED" : "SUBMITTED", { txHash: result.txHash });
      executionStore.replace(confirmed);
      state.executionAttempt = confirmed;

      const executionEvents = createExecutionAuditEvents({
        intent: approvedIntent,
        actor: approvedIntent.requesterId,
        txHash: result.txHash,
        executionAttemptId: attempt.id
      }).filter((event) => event.type !== "EXECUTION_STARTED");
      state.auditEvents = [...state.auditEvents, ...executionEvents];
      auditStore.append(executionEvents);

      let reconciliation: TransactionReconciliation;
      try {
        const chainTransaction = await adapter.getTransaction(result.txHash);
        reconciliation = reconcilePaymentTransaction(approvedIntent, chainTransaction);
      } catch (error) {
        const lookupError = error instanceof Error ? error.message : "TRANSACTION_LOOKUP_FAILED";
        if (lookupError !== "SOLANA_TRANSACTION_NOT_FOUND") throw error;
        reconciliation = {
          status: "NOT_FOUND",
          transaction: null,
          mismatches: ["TRANSACTION_NOT_FOUND"]
        };
        state.error = lookupError;
      }

      state.reconciliation = reconciliation;
      if (reconciliation.status === "MATCHED") {
        state.lastReconciledTxSignature = result.txHash;
        const reconciled = nextExecutionAttemptState(confirmed, "RECONCILED", { txHash: result.txHash });
        executionStore.replace(reconciled);
        state.executionAttempt = reconciled;
      }

      const reconciliationEvent = createTransactionReconciliationAuditEvent({
        intent: approvedIntent,
        actor: approvedIntent.requesterId,
        txHash: result.txHash,
        status: reconciliation.status,
        executionAttemptId: attempt.id
      });
      state.auditEvents = [...state.auditEvents, reconciliationEvent];
      auditStore.append([reconciliationEvent]);
      render();
    } catch (error) {
      const message = error instanceof Error ? error.message : "EXECUTION_FAILED";
      state.error = message === "SIMULATED_POST_SUBMISSION_UNCERTAINTY"
        ? "Execution outcome could not be verified safely."
        : message;

      if (executionStarted && approvedIntent && state.executionAttempt && adapterExecutionEntered) {
        const attempt = state.executionAttempt;
        const beforeSubmission = message === "INSUFFICIENT_USDC_BALANCE";
        const failureState = beforeSubmission ? "FAILED_BEFORE_SUBMISSION" : "UNKNOWN_AFTER_SUBMISSION";
        const next = nextExecutionAttemptState(attempt, failureState, { error: message });
        executionStore.replace(next);
        state.executionAttempt = next;

        const event = beforeSubmission
          ? createExecutionFailureAuditEvent({
              intent: approvedIntent,
              actor: approvedIntent.requesterId,
              error: message,
              executionAttemptId: attempt.id
            })
          : createExecutionUnknownAuditEvent({
              intent: approvedIntent,
              actor: approvedIntent.requesterId,
              error: message,
              executionAttemptId: attempt.id
            });
        state.auditEvents = [...state.auditEvents, event];
        auditStore.append([event]);
      } else if (executionStarted && approvedIntent && state.executionAttempt) {
        const attempt = state.executionAttempt;
        const next = nextExecutionAttemptState(attempt, "FAILED_BEFORE_SUBMISSION", { error: message });
        executionStore.replace(next);
        state.executionAttempt = next;
        const failure = createExecutionFailureAuditEvent({
          intent: approvedIntent,
          actor: approvedIntent.requesterId,
          error: message,
          executionAttemptId: attempt.id
        });
        state.auditEvents = [...state.auditEvents, failure];
        auditStore.append([failure]);
      }

      render();
    }
  });
}

const persistedMode = localStorage.getItem("vaeriq:demo:mode:v1");
if (persistedMode === "APPROVE" || persistedMode === "BLOCK" || persistedMode === "UNKNOWN") {
  state.mode = persistedMode;
}
restoreLatestAuditState();
client.wallet.subscribe(render);
render();

(window as Window & { __VAERIQ_BOOT_READY__?: () => void }).__VAERIQ_BOOT_READY__?.();
