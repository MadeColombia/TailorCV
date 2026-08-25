import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { createGateway } from "@ai-sdk/gateway";
//#region src/lib/ai-gateway.server.ts
var ai_gateway_server_exports = /* @__PURE__ */ __exportAll({
	CHAT_MODEL: () => CHAT_MODEL,
	callGateway: () => callGateway,
	createAiProvider: () => createAiProvider,
	parseJsonResponse: () => parseJsonResponse,
	recordUsage: () => recordUsage,
	requireApiKey: () => requireApiKey
});
var CHAT_MODEL = "gpt-5.6-luna";
function createAiProvider(apiKey) {
	return createGateway({ apiKey });
}
function requireApiKey() {
	const key = process.env["OPENAI_API_KEY"];
	if (!key) throw new Error("OPENAI_API_KEY is not configured for this project.");
	return key;
}
/**
* Best-effort token accounting for the admin dashboard. Never blocks or fails
* the generation it is measuring.
*/
async function recordUsage(record) {
	try {
		const { supabaseAdmin } = await import("./client.server-tihDb1Az.js");
		await supabaseAdmin.from("ai_usage").insert({
			user_id: record.userId ?? null,
			feature: record.feature,
			model: record.model,
			prompt_tokens: record.promptTokens,
			completion_tokens: record.completionTokens,
			total_tokens: record.totalTokens
		});
	} catch (error) {
		console.error("[AI Gateway] usage logging failed", error);
	}
}
async function callGateway(messages, options = {}) {
	const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${requireApiKey()}`
		},
		body: JSON.stringify({
			model: CHAT_MODEL,
			messages,
			...options.json ? { response_format: { type: "json_object" } } : {}
		})
	});
	if (!response.ok) {
		const body = await response.text();
		console.error(`[AI Gateway] ${response.status}: ${body}`);
		if (response.status === 429) throw new Error("The AI is busy right now. Please try again in a moment.");
		if (response.status === 402) throw new Error("AI credits are exhausted. Add credits to keep generating.");
		throw new Error(`AI request failed (${response.status}).`);
	}
	const data = await response.json();
	if (options.feature) await recordUsage({
		userId: options.userId ?? null,
		feature: options.feature,
		model: CHAT_MODEL,
		promptTokens: data.usage?.prompt_tokens ?? 0,
		completionTokens: data.usage?.completion_tokens ?? 0,
		totalTokens: data.usage?.total_tokens ?? 0
	});
	return data.choices?.[0]?.message?.content ?? "";
}
function parseJsonResponse(raw) {
	const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
	const start = trimmed.indexOf("{");
	const end = trimmed.lastIndexOf("}");
	const slice = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
	return JSON.parse(slice);
}
//#endregion
export { requireApiKey as i, ai_gateway_server_exports as n, createAiProvider as r, CHAT_MODEL as t };
