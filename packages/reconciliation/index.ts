import type { PaymentIntent, Transaction } from "../domain/index.js";

export type ReconciliationStatus = "MATCHED" | "MISMATCHED" | "NOT_FOUND";

export type TransactionReconciliation = {
  status: ReconciliationStatus;
  transaction: Transaction | null;
  mismatches: string[];
};

export function reconcilePaymentTransaction(
  intent: PaymentIntent,
  transaction: Transaction | null
): TransactionReconciliation {
  if (!transaction) {
    return { status: "NOT_FOUND", transaction: null, mismatches: ["TRANSACTION_NOT_FOUND"] };
  }

  const mismatches: string[] = [];

  if (transaction.chain !== intent.chain) mismatches.push("CHAIN_MISMATCH");
  if (transaction.asset !== intent.asset) mismatches.push("ASSET_MISMATCH");
  if (transaction.amountAtomic !== intent.amountAtomic) mismatches.push("AMOUNT_MISMATCH");
  if (transaction.from !== intent.requesterId) mismatches.push("SENDER_MISMATCH");
  if (transaction.to !== intent.recipient) mismatches.push("RECIPIENT_MISMATCH");
  if (transaction.status !== "CONFIRMED") mismatches.push("TRANSACTION_NOT_CONFIRMED");

  return {
    status: mismatches.length ? "MISMATCHED" : "MATCHED",
    transaction,
    mismatches
  };
}
