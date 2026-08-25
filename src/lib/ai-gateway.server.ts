import { createGateway } from "@ai-sdk/gateway";

export const CHAT_MODEL = "gpt-5.6-luna";

export function createAiProvider(apiKey: string) {
  return createGateway({
    apiKey,
  });
}

export function requireApiKey(): string {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) throw new Error("OPENAI_API_KEY is not configured for this project.");
  return key;
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "file"; file: { filename: string; file_data: string } };

export type GatewayMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
};

/**
 * Direct chat-completions call. Used for one-shot generation where we want
 * JSON back (extraction, tailoring, cover letter) and for PDF file input.
 */
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
  options: { json?: boolean; feature?: string; userId?: string } = {},
): Promise<string> {
  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${requireApiKey()}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[AI Gateway] ${response.status}: ${body}`);
    if (response.status === 429) {
      throw new Error("The AI is busy right now. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits are exhausted. Add credits to keep generating.");
    }
    throw new Error(`AI request failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
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
  return data.choices?.[0]?.message?.content ?? "";
}

export function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const slice = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
  return JSON.parse(slice) as T;
}
