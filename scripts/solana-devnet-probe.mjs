import { address, createClient } from "@solana/kit";
import { solanaDevnetRpc } from "@solana/kit-plugin-rpc";
import { fetchMint } from "@solana-program/token";

const USDC_MINT = address("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const client = createClient().use(solanaDevnetRpc());

const slot = await client.rpc.getSlot().send();
const mint = await fetchMint(client.rpc, USDC_MINT);

console.log(JSON.stringify({
  network: "solana-devnet",
  slot: slot.value,
  usdcMint: USDC_MINT,
  decimals: mint.data.decimals,
  status: "ok"
}, null, 2));
