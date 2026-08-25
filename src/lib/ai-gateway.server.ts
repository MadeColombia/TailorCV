import { createGateway } from "@ai-sdk/gateway";
import {
  checkRateLimit,
  pruneRateLimit,
  screenAiOutput,
  type RateLimitState,
} from "./chat-guard";

export const CHAT_MODEL = "openai/gpt-5.6-luna";

export const FEATURE_MAX_TOKENS: Record<string, number> = {
  tailor_cv: 3000,
  cover_letter: 800,
  interview_prep: 1500,
  offer_summary: 600,
  offer_analysis: 1500,
  extract_cv: 2500,
  translate: 2500,
  target_cv: 3000,
  dossier_merge: 1000,
  chat_coaching: 1500,
};

const FUNCTION_RATE_LIMIT = 15; // 15 generation calls
const FUNCTION_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const functionRateState: RateLimitState = new Map();

export function createAiProvider(apiKey: string) {
  return createGateway({
    apiKey,
  });
}

export function requireApiKey(): string {
  const key = process.env["OPENAI_API_KEY"];
  if (!key)
    throw new Error("OPENAI_API_KEY is not configured for this project.");
  return key;
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "file"; file: { filename: string; file_data: string } };

export type GatewayMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
};

export type UsageRecord = {
  userId?: string | null;
  feature: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

/**
 * Best-effort token accounting for the admin dashboard. Never blocks or fails
 * the generation it is measuring.
 */
export async function recordUsage(record: UsageRecord): Promise<void> {
  try {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_usage").insert({
      user_id: record.userId ?? null,
      feature: record.feature,
      model: record.model,
      prompt_tokens: record.promptTokens,
      completion_tokens: record.completionTokens,
      total_tokens: record.totalTokens,
    } as never);
  } catch (error) {
    console.error("[AI Gateway] usage logging failed", error);
  }
}

export async function callGateway(
  messages: GatewayMessage[],
  options: {
    json?: boolean;
    feature?: string;
    userId?: string;
    maxTokens?: number;
  } = {},
): Promise<string> {
  const now = Date.now();
  if (options.userId) {
    pruneRateLimit(functionRateState, now);
    const limit = checkRateLimit(
      functionRateState,
      options.userId,
      now,
      FUNCTION_RATE_LIMIT,
      FUNCTION_RATE_WINDOW_MS,
    );
    if (!limit.allowed) {
      throw new Error(
        `AI usage limit reached. Please wait ${limit.retryAfterSeconds} seconds before generating again.`,
      );
    }
  }

  const maxTokens =
    options.maxTokens ??
    (options.feature ? (FEATURE_MAX_TOKENS[options.feature] ?? 2000) : 2000);

  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireApiKey()}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      max_tokens: maxTokens,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[AI Gateway] ${response.status}: ${body}`);
    if (response.status === 429) {
      throw new Error(
        "The AI is busy right now. Please try again in a moment.",
      );
    }
    if (response.status === 402) {
      throw new Error(
        "AI credits are exhausted. Add credits to keep generating.",
      );
    }
    throw new Error(`AI request failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };

  if (options.feature) {
    await recordUsage({
      userId: options.userId ?? null,
      feature: options.feature,
      model: CHAT_MODEL,
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    });
  }

  const rawContent = data.choices?.[0]?.message?.content ?? "";
  return screenAiOutput(rawContent);
}

export function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const slice =
    start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
  return JSON.parse(slice) as T;
}
