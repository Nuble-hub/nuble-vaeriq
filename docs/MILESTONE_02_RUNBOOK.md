# Milestone 02 — Runtime Verification Runbook

## Transaction reconciliation

### Expected APPROVE flow

1. Connect the Solana Devnet wallet.
2. Use the compliant scenario with a funded USDC balance.
3. Evaluate the payment.
4. Confirm the decision is `APPROVE`.
5. Execute the payment in the wallet.
6. Wait for the success state.

Expected audit sequence:

    POLICY_EVALUATED
    RISK_EVALUATED
    DECISION_MADE:APPROVE
    EXECUTION_STARTED
    TRANSACTION_SUBMITTED
    TRANSACTION_CONFIRMED
    TRANSACTION_RECONCILED

Expected reconciliation result:

    MATCHED

The `TRANSACTION_RECONCILED` event should reference the same transaction signature returned by the execution path.

### Expected BLOCK flow

1. Switch to the adversarial scenario.
2. Use the blocked destination and high amount.
3. Evaluate the payment.

Expected behavior:

    DECISION_MADE:BLOCK

No signing, submission, confirmation, or reconciliation event should be created for the blocked intent.

### Expected execution-failure flow

1. Use an otherwise approved payment.
2. Set the amount above the wallet's current USDC balance.
3. Evaluate and execute.

Expected audit sequence:

    DECISION_MADE:APPROVE
    EXECUTION_STARTED
    EXECUTION_FAILED:INSUFFICIENT_USDC_BALANCE

No transaction submission or confirmation event should be recorded for this pre-submission failure.

### Acceptance evidence

Capture the following screenshots for the milestone evidence package:

- APPROVE with `MATCHED` reconciliation and transaction signature.
- BLOCK with no transaction signature or execution events.
- Execution failure with `EXECUTION_FAILED` and no submission/confirmation.
- Recent persisted events after a browser refresh.
