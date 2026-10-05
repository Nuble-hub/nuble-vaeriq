export type ExternalSignalType = "SOCIAL_MENTION";

export type ExternalSignalMetrics = {
  likes: number;
  reposts: number;
  views: number;
  quotes: number;
  replies: number;
  bookmarks: number;
  smartReposts: number;
  cryptoTwitterReposts: number;
};

export type ExternalSignal = {
  provider: "elfa";
  subject: string;
  signalType: ExternalSignalType;
  sourceId: string;
  sourceUrl: string;
  observedAt: string;
  sourceType: string;
  author?: {
    username: string;
    isVerified: boolean;
  };
  metrics: ExternalSignalMetrics;
};

export type ExternalIntelligenceQuery = {
  accountName?: string;
  keywords?: string[];
  timeWindow?: string;
  limit?: number;
  searchType?: "and" | "or";
  reposts?: boolean;
};

type ElfaMention = {
  tweetId: string;
  link: string;
  likeCount: number | null;
  repostCount: number | null;
  viewCount: number | null;
  quoteCount: number | null;
  replyCount: number | null;
  bookmarkCount: number | null;
  mentionedAt: string;
  type: string;
  repostBreakdown?: {
    smart?: number;
    ct?: number;
  };
  account?: {
    username?: string;
    isVerified?: boolean;
  };
};

type ElfaResponse = {
  success: boolean;
  data: ElfaMention[];
  metadata?: {
    cursor?: number;
    total?: number;
  };
};

export interface ExternalIntelligenceProvider {
  getSignals(query: ExternalIntelligenceQuery): Promise<ExternalSignal[]>;
}

export class ElfaExternalIntelligenceProvider implements ExternalIntelligenceProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(args: { apiKey: string; baseUrl?: string; fetchImpl?: typeof fetch }) {
    if (!args.apiKey.trim()) throw new Error("ELFA_API_KEY_REQUIRED");
    this.apiKey = args.apiKey.trim();
    this.baseUrl = (args.baseUrl ?? "https://api.elfa.ai").replace(/\/$/, "");
    this.fetchImpl = args.fetchImpl ?? fetch;
  }

  async getSignals(query: ExternalIntelligenceQuery): Promise<ExternalSignal[]> {
    if (!query.accountName && (!query.keywords || query.keywords.length === 0)) {
      throw new Error("ELFA_QUERY_REQUIRED");
    }
    if (query.keywords && query.keywords.length > 5) throw new Error("ELFA_MAX_5_KEYWORDS");
    if (query.limit !== undefined && (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 30)) {
      throw new Error("ELFA_LIMIT_OUT_OF_RANGE");
    }

    const params = new URLSearchParams();
    if (query.keywords?.length) params.set("keywords", query.keywords.join(","));
    if (query.accountName) params.set("accountName", query.accountName);
    if (query.timeWindow) params.set("timeWindow", query.timeWindow);
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.searchType) params.set("searchType", query.searchType);
    if (query.reposts !== undefined) params.set("reposts", String(query.reposts));

    const response = await this.fetchImpl(
      `${this.baseUrl}/v2/data/keyword-mentions?${params.toString()}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-elfa-api-key": this.apiKey
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error("ELFA_UNAUTHORIZED");
      if (response.status === 429) throw new Error("ELFA_RATE_LIMITED");
      throw new Error(`ELFA_API_ERROR_${response.status}`);
    }

    const payload = (await response.json()) as ElfaResponse;
    if (!payload.success) throw new Error("ELFA_REQUEST_UNSUCCESSFUL");

    const subject = query.accountName ?? (query.keywords?.join(",") ?? "unknown");
    return payload.data.map((mention) => normalizeElfaMention(mention, subject));
  }
}

export function normalizeElfaMention(mention: ElfaMention, subject: string): ExternalSignal {
  return {
    provider: "elfa",
    subject,
    signalType: "SOCIAL_MENTION",
    sourceId: mention.tweetId,
    sourceUrl: mention.link,
    observedAt: mention.mentionedAt,
    sourceType: mention.type,
    ...(mention.account?.username
      ? {
          author: {
            username: mention.account.username,
            isVerified: Boolean(mention.account.isVerified)
          }
        }
      : {}),
    metrics: {
      likes: mention.likeCount ?? 0,
      reposts: mention.repostCount ?? 0,
      views: mention.viewCount ?? 0,
      quotes: mention.quoteCount ?? 0,
      replies: mention.replyCount ?? 0,
      bookmarks: mention.bookmarkCount ?? 0,
      smartReposts: mention.repostBreakdown?.smart ?? 0,
      cryptoTwitterReposts: mention.repostBreakdown?.ct ?? 0
    }
  };
}
