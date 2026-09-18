import { address, createClient } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";
import { evaluatePayment } from "../../../packages/evaluation/index.js";
import { authorizeExecution } from "../../../packages/decision/execution-guard.js";
import { createExecutionAuditEvents, createExecutionFailureAuditEvent, createTransactionReconciliationAuditEvent, createAuditEvent } from "../../../packages/audit/index.js";
import { JsonAuditEventStore } from "../../../packages/audit/store.js";
import type { AuditEvent } from "../../../packages/domain/index.js";
import { reconcilePaymentTransaction, type TransactionReconciliation } from "../../../packages/reconciliation/index.js";
import { SolanaAdapter, SOLANA_DEVNET_RPC, SOLANA_DEVNET_USDC_MINT } from "../../../adapters/solana/index.js";
import type { PaymentContext, PaymentIntent, PolicySet } from "../../../packages/domain/index.js";
import "./styles.css";

const DEMO_DESTINATION = "HQVxiMVDoV9jzG4tpoxmDZsNfWvaHXm8DGGv93Gka75v";
const BLOCK_DESTINATION = "11111111111111111111111111111111";
const USDC_DECIMALS = 6;

const client = createClient()
  .use(walletSigner({ chain: "solana:devnet" }))
  .use(solanaRpc({ rpcUrl: SOLANA_DEVNET_RPC }));

const auditStore = new JsonAuditEventStore(window.localStorage);

const state = {
  mode: "APPROVE" as "APPROVE" | "BLOCK",
  intent: null as PaymentIntent | null,
  result: null as ReturnType<typeof evaluatePayment> | null,
  txSignature: "",
  auditEvents: [] as AuditEvent[],
  reconciliation: null as TransactionReconciliation | null,
  error: ""
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
  const approvedDestination = mode === "APPROVE" ? recipient : DEMO_DESTINATION;
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
  const known = mode === "APPROVE" ? [state.intent?.recipient ?? DEMO_DESTINATION] : [DEMO_DESTINATION];
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
    evidence: [{ id: "invoice:INV-001", type: "INVOICE", summary: "Demo invoice INV-001 is attached." }]
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

function render() {
  const walletState = client.wallet.getState();
  const connected = walletState.connected;
  const wallets = walletState.wallets;
  const walletStatus = walletState.status;
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const decision = state.result?.result.decision;
  const reasons = state.result?.result.reasons ?? [];
  const signature = state.txSignature;
  const auditEvents = state.auditEvents;
  const reconciliation = state.reconciliation;

  const connectInProgress = walletStatus === "pending" || walletStatus === "connecting" || walletStatus === "reconnecting";
  const connectLabel = connectInProgress ? "Connecting…" : `Connect wallet${wallets[0] ? ` · ${wallets[0].name}` : ""}`;

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div>
          <div class="eyebrow">NUBLE / VAERIQ</div>
          <h1>Control before value moves.</h1>
          <p class="sub">Milestone 01 · Solana Devnet · Stablecoin payment control</p>
        </div>
        <div class="wallet-box">
          <span>${connected ? `Connected · ${connected.account.address.slice(0, 4)}…${connected.account.address.slice(-4)}` : "Wallet not connected"}</span>
          ${connected ? "" : `<button id="connect" ${connectInProgress || walletStatus !== "disconnected" ? "disabled" : ""}>${connectLabel}</button>`}
        </div>
      </header>

      <section class="grid">
        <div class="card">
          <div class="card-title">Payment Intent</div>
          <label>Scenario</label>
          <div class="scenario-row">
            <button class="mode ${state.mode === "APPROVE" ? "active" : ""}" id="approve-mode">Compliant · APPROVE</button>
            <button class="mode ${state.mode === "BLOCK" ? "active" : ""}" id="block-mode">Adversarial · BLOCK</button>
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
              <input id="invoice" value="${state.intent?.invoiceRef ?? (state.mode === "BLOCK" ? "" : "INV-001")}" />
            </div>
          </div>

          <button class="primary" id="evaluate">Evaluate payment</button>
          <p class="hint">The decision is deterministic. The connected wallet is only asked to sign after an explicit APPROVE.</p>
        </div>

        <div class="card decision-card">
          <div class="card-title">Decision Engine</div>
          <div class="pipeline">
            <span>Intent</span><b>→</b><span>Policy</span><b>→</b><span>Risk</span><b>→</b><strong class="decision ${(decision ?? "idle").toLowerCase()}">${decision ?? "WAITING"}</strong>
          </div>
          <div class="reason-box">
            ${reasons.length ? reasons.map((x) => `<div>• ${x}</div>`).join("") : `<div class="muted">Run an evaluation to see the control evidence.</div>`}
          </div>
          <button class="execute" id="execute" ${decision === "APPROVE" ? "" : "disabled"}>Execute approved payment</button>
          ${state.error ? `<div class="error">${state.error}</div>` : ""}
          ${signature ? `<div class="success">Executed · ${signature.slice(0, 12)}…</div><a href="https://explorer.solana.com/tx/${signature}?cluster=devnet" target="_blank" rel="noreferrer">View Devnet transaction ↗</a>` : ""}
        </div>
      </section>

      <section class="audit card">
        <div class="card-title">Audit Trail</div>
        <div class="audit-row"><span>Network</span><strong>Solana Devnet</strong></div>
        <div class="audit-row"><span>USDC mint</span><code>${SOLANA_DEVNET_USDC_MINT}</code></div>
        <div class="audit-row"><span>Intent</span><code>${state.intent?.id ?? "—"}</code></div>
        <div class="audit-row"><span>Decision</span><strong>${decision ?? "—"}</strong></div>
        <div class="audit-row"><span>Transaction signature</span><code>${signature || "—"}</code></div>
        <div class="audit-row"><span>Reconciliation</span><strong class="recon ${reconciliation?.status?.toLowerCase() ?? "idle"}">${reconciliation?.status ?? "—"}</strong></div>
        <div class="audit-row"><span>Audit events</span><code>${auditEvents.length ? auditEvents.map((event) => `${event.type}:${event.payloadRef ?? ""}`).join(" · ") : "—"}</code></div>
        <div class="card-title recent-title">Recent persisted events</div>
        <div class="recent-events">
          ${auditStore.list(10).slice().reverse().map((event) => `<div class="recent-event"><strong>${event.type}</strong><span>${event.intentId}</span><code>${event.payloadRef ?? ""}</code></div>`).join("") || `<div class="muted">No persisted audit events yet.</div>`}
        </div>
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

  document.querySelector("#approve-mode")?.addEventListener("click", () => { state.mode = "APPROVE"; state.intent = null; state.result = null; state.txSignature = ""; state.auditEvents = []; state.reconciliation = null; state.error = ""; render(); });
  document.querySelector("#block-mode")?.addEventListener("click", () => { state.mode = "BLOCK"; state.intent = null; state.result = null; state.txSignature = ""; state.auditEvents = []; state.reconciliation = null; state.error = ""; render(); });

  document.querySelector<HTMLButtonElement>("#evaluate")?.addEventListener("click", () => {
    state.error = "";
    state.txSignature = "";
    state.auditEvents = [];
    state.reconciliation = null;
    try {
      const intent = buildIntent();
      state.intent = intent;
      state.result = evaluatePayment({ intent, policy: policyFor(state.mode, intent.recipient), context: contextFor(state.mode) });
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
    let approvedIntent: PaymentIntent | null = null;
    let executionStarted = false;
    let transactionSubmitted = false;
    try {
      if (!state.result || !state.intent) throw new Error("EVALUATE_FIRST");
      approvedIntent = authorizeExecution(state.intent, state.result.result);
      const started = createAuditEvent({
        id: `${approvedIntent.id}:execution-started`,
        type: "EXECUTION_STARTED",
        actor: approvedIntent.requesterId,
        intentId: approvedIntent.id,
        organizationId: approvedIntent.organizationId,
        payloadRef: "execution:started"
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
      const result = await adapter.execute(approvedIntent);
      transactionSubmitted = true;
      state.txSignature = result.txHash;
      const executionEvents = createExecutionAuditEvents({ intent: approvedIntent, actor: approvedIntent.requesterId, txHash: result.txHash }).filter((event) => event.type !== "EXECUTION_STARTED");
      state.auditEvents = [...state.auditEvents, ...executionEvents];
      auditStore.append(executionEvents);

      const chainTransaction = await adapter.getTransaction(result.txHash);
      const reconciliation = reconcilePaymentTransaction(approvedIntent, chainTransaction);
      state.reconciliation = reconciliation;
      const reconciliationEvent = createTransactionReconciliationAuditEvent({
        intent: approvedIntent,
        actor: approvedIntent.requesterId,
        txHash: result.txHash,
        status: reconciliation.status
      });
      state.auditEvents = [...state.auditEvents, reconciliationEvent];
      auditStore.append([reconciliationEvent]);
      render();
    } catch (error) {
      const message = error instanceof Error ? error.message : "EXECUTION_FAILED";
      state.error = message;
      if (executionStarted && !transactionSubmitted && approvedIntent) {
        const failure = createExecutionFailureAuditEvent({ intent: approvedIntent, actor: approvedIntent.requesterId, error: message });
        state.auditEvents = [...state.auditEvents, failure];
        auditStore.append([failure]);
      }
      render();
    }
  });
}

client.wallet.subscribe(render);
render();
