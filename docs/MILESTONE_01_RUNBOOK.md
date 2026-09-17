# Milestone 01 — Local Runbook

## 1. Install

Use Node.js 24+ for the hackathon development environment.

```bash
npm install
```

## 2. Verify Devnet connectivity

```bash
npm run solana:probe
```

Expected output includes:

- `network: "solana-devnet"`
- a current `slot`
- the configured Devnet USDC mint
- `decimals: 6`
- `status: "ok"`

## 3. Start the web demo

```bash
npm run web:dev
```

Open the Vite URL shown in the terminal.

## 4. Connect a browser wallet

The demo uses Solana Wallet Standard through `@solana/kit-plugin-wallet`. Select a wallet configured for Solana Devnet.

The wallet must have enough Devnet SOL to pay the transaction fee and enough Devnet USDC to cover the demo payment. Never paste a private key or seed phrase into the repository or chat.

## 5. APPROVE path

Use the `Compliant · APPROVE` scenario.

1. Connect the wallet.
2. Keep the sample recipient or replace it with a valid destination wallet.
3. Keep the default `12` USDC and `INV-001` invoice reference.
4. Click **Evaluate payment**.
5. Confirm the decision is `APPROVE`.
6. Click **Execute approved payment**.
7. Approve the wallet signature.
8. Confirm that a Devnet transaction signature appears in the Audit Trail and that the Explorer link resolves.

## 6. BLOCK path

Switch to `Adversarial · BLOCK`.

1. Click **Evaluate payment**.
2. Confirm the decision is `BLOCK`.
3. The **Execute approved payment** button must remain disabled.
4. No wallet signing request and no transaction signature should appear.

## 7. Milestone evidence

Capture one short screen recording showing both paths:

```text
APPROVE → wallet signature → Devnet tx signature → audit
BLOCK   → no signer → no tx
```

The milestone is complete only after the Devnet transaction has been executed successfully and the blocked path has been observed to stop before signing.
