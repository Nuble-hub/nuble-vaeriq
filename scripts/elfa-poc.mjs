#!/usr/bin/env node

import { ElfaExternalIntelligenceProvider } from "../dist/packages/external-intelligence/index.js";

function usage() {
  console.error([
    "Usage:",
    "  ELFA_API_KEY=... npm run poc:elfa -- --account <x_username>",
    "  ELFA_API_KEY=... npm run poc:elfa -- --keywords <term1,term2>",
    "",
    "Optional:",
    "  --time-window <window>   default: 7d",
    "  --limit <1-30>           default: 10",
    "  --search-type <and|or>   default: or",
    "  --reposts <true|false>   default: false"
  ].join("\n"));
  process.exit(1);
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`INVALID_BOOLEAN:${value}`);
}

const accountName = readArg("--account");
const keywordsValue = readArg("--keywords");
const timeWindow = readArg("--time-window") ?? "7d";
const limitValue = readArg("--limit") ?? "10";
const searchType = readArg("--search-type") ?? "or";
const reposts = parseBoolean(readArg("--reposts"), false);

if ((!accountName && !keywordsValue) || (accountName && keywordsValue)) usage();

const limit = Number(limitValue);
if (!Number.isInteger(limit) || limit < 1 || limit > 30) throw new Error("INVALID_LIMIT");

const apiKey = process.env.ELFA_API_KEY;
if (!apiKey) throw new Error("ELFA_API_KEY_REQUIRED");

const provider = new ElfaExternalIntelligenceProvider({ apiKey });
const signals = await provider.getSignals({
  accountName,
  keywords: keywordsValue ? keywordsValue.split(",").map((value) => value.trim()).filter(Boolean) : undefined,
  timeWindow,
  limit,
  searchType,
  reposts
});

const aggregate = signals.reduce(
  (acc, signal) => ({
    mentions: acc.mentions + 1,
    views: acc.views + signal.metrics.views,
    likes: acc.likes + signal.metrics.likes,
    reposts: acc.reposts + signal.metrics.reposts
  }),
  { mentions: 0, views: 0, likes: 0, reposts: 0 }
);

console.log(JSON.stringify({
  provider: "elfa",
  subject: accountName ?? keywordsValue,
  query: { timeWindow, limit, searchType, reposts },
  summary: aggregate,
  signals
}, null, 2));
