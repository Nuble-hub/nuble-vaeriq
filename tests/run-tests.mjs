import { strict as assert } from 'node:assert';
import { evaluateIntent } from '../dist/packages/decision/index.js';
import { authorizeExecution } from '../dist/packages/decision/execution-guard.js';

const recipient = 'DemoVendor111111111111111111111111111111111';
const baseIntent = { id: 'pi_test', organizationId: 'org_test', requesterType: 'agent', requesterId: 'agent_001', recipient, asset: 'USDC', purpose: 'API infrastructure', counterpartyId: 'vendor_a', invoiceRef: 'INV-001', chain: 'solana', status: 'SUBMITTED', createdAt: new Date().toISOString() };
const policy = { id: 'policy_test', version: 1, active: true, defaultEffect: 'ALLOW', rules: [
  { id: 'block-asset', type: 'ASSET', operator: 'NOT_IN', value: ['USDC'], effect: 'BLOCK', message: 'Asset policy violation.' },
  { id: 'block-destination', type: 'DESTINATION', operator: 'NOT_IN', value: [recipient], effect: 'BLOCK', message: 'Destination policy violation.' }
] };
const context = { knownDestinations: [recipient], knownCounterparties: ['vendor_a'], approvedAssets: ['USDC'], historicalMedianAtomic: '2000000000', recentIntents: [], invoiceRequiredAboveAtomic: '1000000000', agentSinglePaymentLimitAtomic: '5000000000', agentDailyLimitAtomic: '20000000000', agentSpentTodayAtomic: '1000000000', evidence: [{ id: 'invoice:INV-001', type: 'INVOICE', summary: 'Invoice exists.' }] };

const approvedIntent = { ...baseIntent, amountAtomic: '1200000000' };
const approved = evaluateIntent(approvedIntent, policy, context);
assert.equal(approved.intentId, approvedIntent.id);
assert.equal(approved.decision, 'APPROVE');
assert.equal(authorizeExecution(approvedIntent, approved).status, 'APPROVED');

const mismatchedIntent = { ...approvedIntent, id: 'pi_other' };
assert.throws(
  () => authorizeExecution(mismatchedIntent, approved),
  /EXECUTION_NOT_AUTHORIZED:INTENT_MISMATCH/
);

const tamperedPolicyApproval = {
  ...approved,
  policy: {
    ...approved.policy,
    result: 'REVIEW',
    requiresReview: true
  }
};
assert.throws(
  () => authorizeExecution(approvedIntent, tamperedPolicyApproval),
  /EXECUTION_NOT_AUTHORIZED:POLICY_NOT_PASS/
);

const tamperedHighRiskApproval = {
  ...approved,
  risk: {
    ...approved.risk,
    severitySummary: 'HIGH'
  }
};
assert.throws(
  () => authorizeExecution(approvedIntent, tamperedHighRiskApproval),
  /EXECUTION_NOT_AUTHORIZED:HIGH_RISK/
);

const executedIntent = { ...approvedIntent, status: 'EXECUTED' };
assert.throws(
  () => authorizeExecution(executedIntent, approved),
  /EXECUTION_NOT_AUTHORIZED:INVALID_INTENT_STATUS:EXECUTED/
);

const reviewIntent = { ...baseIntent, amountAtomic: '4000000000', invoiceRef: undefined };
const review = evaluateIntent(reviewIntent, policy, context);
assert.equal(review.intentId, reviewIntent.id);
assert.equal(review.decision, 'REVIEW');
assert.throws(() => authorizeExecution(reviewIntent, review), /EXECUTION_NOT_AUTHORIZED:REVIEW/);

const blockedIntent = { ...baseIntent, recipient: 'BadDestination1111111111111111111111111111111', amountAtomic: '8500000000', invoiceRef: undefined };
const blocked = evaluateIntent(blockedIntent, policy, context);
assert.equal(blocked.intentId, blockedIntent.id);
assert.equal(blocked.decision, 'BLOCK');
assert.throws(() => authorizeExecution(blockedIntent, blocked), /EXECUTION_NOT_AUTHORIZED:BLOCK/);
assert.ok(blocked.risk.signals.some((s) => s.type === 'NEW_DESTINATION'));
assert.ok(blocked.risk.signals.some((s) => s.type === 'AMOUNT_ANOMALY'));
assert.ok(blocked.risk.signals.some((s) => s.type === 'MISSING_INVOICE'));
assert.ok(blocked.risk.signals.some((s) => s.type === 'BUDGET_EXCEEDED'));

console.log('VAERIQ Milestone 02 control-boundary gate: PASS');
console.log(JSON.stringify({
  approved: approved.decision,
  review: review.decision,
  blocked: blocked.decision,
  intentBinding: 'PASS',
  executionGuard: 'PASS'
}, null, 2));
