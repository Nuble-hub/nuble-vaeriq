import { strict as assert } from "node:assert";
import { ElfaExternalIntelligenceProvider, normalizeElfaMention } from "../dist/packages/external-intelligence/index.js";

const normalized = normalizeElfaMention({
  tweetId: "123",
  link: "https://x.com/example/status/123",
  likeCount: null,
  repostCount: 3,
  viewCount: 10,
  quoteCount: 1,
  replyCount: 2,
  bookmarkCount: 0,
  mentionedAt: "2026-10-02T10:00:00Z",
  type: "post",
  repostBreakdown: { smart: 2, ct: 1 },
  account: { username: "builder", isVerified: true }
}, "vendor_demo");

assert.deepEqual(normalized.metrics, {
  likes: 0, reposts: 3, views: 10, quotes: 1, replies: 2, bookmarks: 0, smartReposts: 2, cryptoTwitterReposts: 1
});
assert.equal(normalized.provider, "elfa");
assert.equal(normalized.subject, "vendor_demo");
assert.equal(normalized.sourceUrl, "https://x.com/example/status/123");

const calls = [];
const provider = new ElfaExternalIntelligenceProvider({
  apiKey: "test-only",
  baseUrl: "https://api.example.test",
  fetchImpl: async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ success: true, data: [normalized], metadata: { total: 1 } }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }
});

const signals = await provider.getSignals({
  accountName: "vendor_demo",
  timeWindow: "7d",
  limit: 10,
  searchType: "or",
  reposts: false
});

assert.equal(signals.length, 1);
assert.equal(signals[0].subject, "vendor_demo");
assert.equal(new URL(calls[0].url).pathname, "/v2/data/keyword-mentions");
assert.equal(new URL(calls[0].url).searchParams.get("accountName"), "vendor_demo");
assert.equal(calls[0].init.headers["x-elfa-api-key"], "test-only");

const badProvider = new ElfaExternalIntelligenceProvider({
  apiKey: "test-only",
  fetchImpl: async () => new Response("", { status: 401 })
});
await assert.rejects(() => badProvider.getSignals({ accountName: "vendor_demo" }), /ELFA_UNAUTHORIZED/);

const rateLimitedProvider = new ElfaExternalIntelligenceProvider({
  apiKey: "test-only",
  fetchImpl: async () => new Response("", { status: 429 })
});
await assert.rejects(() => rateLimitedProvider.getSignals({ accountName: "vendor_demo" }), /ELFA_RATE_LIMITED/);

await assert.rejects(() => provider.getSignals({}), /ELFA_QUERY_REQUIRED/);

console.log("VAERIQ Elfa external-intelligence POC: PASS");
