import { address, createClient, type TransactionSigner } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { signer } from "@solana/kit-plugin-signer";
import {
  fetchMint,
  fetchToken,
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS
} from "@solana-program/token";

import type { ChainAdapter } from "../../packages/chain-interface/index.js";
import type { ApprovedIntent, Balance, ChainPage, ExecutionResult, PaymentIntent, SimulationResult, Transaction, WalletRef } from "../../packages/domain/index.js";

export const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";
export const SOLANA_DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_DECIMALS = 6;

export type SolanaConfig = {
  rpcUrl?: string;
  usdcMint?: string;
};

/**
 * Concrete chain adapter for Milestone 01.
 * Read/simulation use does not require a signer. Execution requires an
 * explicitly injected signer and can therefore never be reached by core
 * decisioning without crossing the execution-guard boundary first.
 */
export class SolanaAdapter implements ChainAdapter {
  private readonly rpcUrl: string;
  private readonly usdcMint: ReturnType<typeof address>;
  private readonly transactionSigner?: TransactionSigner;

  constructor(config: SolanaConfig = {}, transactionSigner?: TransactionSigner) {
    this.rpcUrl = config.rpcUrl ?? SOLANA_DEVNET_RPC;
    this.usdcMint = address(config.usdcMint ?? SOLANA_DEVNET_USDC_MINT);
    this.transactionSigner = transactionSigner;
  }

  private readClient() {
    return createClient().use(solanaRpc({ rpcUrl: this.rpcUrl }));
  }

  private executionClient() {
    if (!this.transactionSigner) throw new Error("SOLANA_SIGNER_NOT_CONFIGURED");
    return createClient().use(signer(this.transactionSigner)).use(solanaRpc({ rpcUrl: this.rpcUrl }));
  }

  async getBalance(wallet: WalletRef): Promise<Balance[]> {
    const client = this.readClient();
    const owner = address(wallet.address);
    const result: Balance[] = [];
    const lamports = await client.rpc.getBalance(owner).send();
    result.push({ asset: "SOL", amountAtomic: lamports.value.toString() });

    const [tokenAccount] = await findAssociatedTokenPda({ mint: this.usdcMint, owner, tokenProgram: TOKEN_PROGRAM_ADDRESS });
    try {
      const token = await fetchToken(client.rpc, tokenAccount);
      result.push({ asset: "USDC", amountAtomic: token.data.amount.toString() });
    } catch {
      result.push({ asset: "USDC", amountAtomic: "0" });
    }
    return result;
  }

  async getTransactions(_wallet: WalletRef, _cursor?: string): Promise<ChainPage<Transaction>> {
    return { items: [] };
  }

  async simulateIntent(intent: PaymentIntent): Promise<SimulationResult> {
    if (intent.chain !== "solana") return { ok: false, message: "CHAIN_MISMATCH" };
    if (intent.asset !== "USDC") return { ok: false, message: "UNSUPPORTED_ASSET" };
    if (!/^\d+$/.test(intent.amountAtomic) || BigInt(intent.amountAtomic) <= 0n) return { ok: false, message: "INVALID_ATOMIC_AMOUNT" };

    const client = this.readClient();
    const mint = await fetchMint(client.rpc, this.usdcMint);
    if (mint.data.decimals !== USDC_DECIMALS) return { ok: false, message: `USDC_DECIMALS_MISMATCH:${mint.data.decimals}` };
    return { ok: true, message: "Solana Devnet USDC configuration validated." };
  }

  async execute(intent: ApprovedIntent): Promise<ExecutionResult> {
    if (intent.chain !== "solana") throw new Error("CHAIN_MISMATCH");
    if (intent.asset !== "USDC") throw new Error("UNSUPPORTED_ASSET");
    if (!this.transactionSigner) throw new Error("SOLANA_SIGNER_NOT_CONFIGURED");
    if (!/^\d+$/.test(intent.amountAtomic) || BigInt(intent.amountAtomic) <= 0n) throw new Error("INVALID_ATOMIC_AMOUNT");

    const client = this.executionClient();
    const recipient = address(intent.recipient);
    const [sourceAta] = await findAssociatedTokenPda({ mint: this.usdcMint, owner: this.transactionSigner.address, tokenProgram: TOKEN_PROGRAM_ADDRESS });
    const [destinationAta] = await findAssociatedTokenPda({ mint: this.usdcMint, owner: recipient, tokenProgram: TOKEN_PROGRAM_ADDRESS });

    const sourceToken = await fetchToken(client.rpc, sourceAta);
    if (sourceToken.data.mint !== this.usdcMint) throw new Error("SOURCE_TOKEN_MINT_MISMATCH");
    if (sourceToken.data.amount < BigInt(intent.amountAtomic)) throw new Error("INSUFFICIENT_USDC_BALANCE");

    const createDestinationAta = getCreateAssociatedTokenIdempotentInstruction({ payer: client.payer, ata: destinationAta, owner: recipient, mint: this.usdcMint });
    const transfer = getTransferCheckedInstruction({
      source: sourceAta,
      mint: this.usdcMint,
      destination: destinationAta,
      authority: client.payer,
      amount: BigInt(intent.amountAtomic),
      decimals: USDC_DECIMALS
    });

    const result = await client.sendTransaction([createDestinationAta, transfer]);
    return { txHash: result.context.signature, confirmed: true };
  }

  async getTransaction(_hash: string): Promise<Transaction> {
    throw new Error("SOLANA_TRANSACTION_LOOKUP_NOT_IMPLEMENTED");
  }
}
