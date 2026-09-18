import { address, createClient, signature, type TransactionSigner } from "@solana/kit";
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

  async getTransaction(hash: string): Promise<Transaction> {
    const client = this.readClient();
    const rpcTransaction = await client.rpc.getTransaction(signature(hash), {
      commitment: "confirmed",
      encoding: "jsonParsed",
      maxSupportedTransactionVersion: 1
    }).send() as unknown as RpcTransactionSnapshot | null;

    if (!rpcTransaction) throw new Error("SOLANA_TRANSACTION_NOT_FOUND");

    const accountKeys = rpcTransaction.transaction?.message?.accountKeys ?? [];
    const instructions = rpcTransaction.transaction?.message?.instructions ?? [];
    const transfer = instructions
      .map((instruction) => instruction.parsed)
      .find((parsed) => {
        if (!parsed || (parsed.type !== "transfer" && parsed.type !== "transferChecked")) return false;
        const info = parsed.info;
        return parsed.type === "transferChecked" && info?.mint === this.usdcMint;
      });

    const sourceTokenAccount = typeof transfer?.info?.source === "string" ? transfer.info.source : "";
    const destinationTokenAccount = typeof transfer?.info?.destination === "string" ? transfer.info.destination : "";
    const from = findTokenOwner(sourceTokenAccount, accountKeys, rpcTransaction.meta);
    const to = findTokenOwner(destinationTokenAccount, accountKeys, rpcTransaction.meta);

    const amountAtomic =
      transfer?.type === "transferChecked"
        ? readString(transfer.info?.tokenAmount?.amount)
        : readString(transfer?.info?.amount);

    const metaError = rpcTransaction.meta?.err ?? null;
    const blockTime = rpcTransaction.blockTime;
    const timestamp = typeof blockTime === "number"
      ? new Date(blockTime * 1000).toISOString()
      : typeof blockTime === "bigint"
        ? new Date(Number(blockTime) * 1000).toISOString()
        : "unknown";

    return {
      hash,
      chain: "solana",
      asset: transfer ? "USDC" : "UNKNOWN",
      amountAtomic: amountAtomic ?? "0",
      from: from ?? "",
      to: to ?? "",
      timestamp,
      status: metaError === null ? "CONFIRMED" : "FAILED",
      slot: rpcTransaction.slot.toString(),
      feeAtomic: readString(rpcTransaction.meta?.fee)
    };
  }
}


type RpcTokenBalance = {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount?: { amount?: string };
};

type RpcParsedInstruction = {
  parsed?: {
    type?: string;
    info?: {
      mint?: string;
      source?: string;
      destination?: string;
      amount?: string;
      tokenAmount?: { amount?: string };
    };
  };
};

type RpcTransactionSnapshot = {
  blockTime?: number | bigint | null;
  slot: bigint | number;
  meta?: {
    err?: unknown | null;
    fee?: bigint | number | string | null;
    preTokenBalances?: RpcTokenBalance[] | null;
    postTokenBalances?: RpcTokenBalance[] | null;
  } | null;
  transaction: {
    message: {
      accountKeys: Array<{ pubkey?: string } | string>;
      instructions: RpcParsedInstruction[];
    };
  };
};

function readString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "bigint" || typeof value === "number") return value.toString();
  return undefined;
}

function accountKeyAt(accountKeys: RpcTransactionSnapshot["transaction"]["message"]["accountKeys"], index: number): string {
  const entry = accountKeys[index];
  return typeof entry === "string" ? entry : entry?.pubkey ?? "";
}

function findTokenOwner(
  tokenAccount: string,
  accountKeys: RpcTransactionSnapshot["transaction"]["message"]["accountKeys"],
  meta: RpcTransactionSnapshot["meta"]
): string | undefined {
  if (!tokenAccount || !meta) return undefined;
  const balances = [...(meta.preTokenBalances ?? []), ...(meta.postTokenBalances ?? [])];
  const match = balances.find((balance) => accountKeyAt(accountKeys, balance.accountIndex) === tokenAccount && typeof balance.owner === "string");
  return match?.owner;
}
