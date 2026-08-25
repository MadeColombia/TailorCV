import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { t as createServerRpc } from "./createServerRpc-MBa5GZ-L.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
import { a as validateOfferUrl, i as jsonLdOffer, n as failedOffer, r as htmlToText, t as buildOfferAnalysis } from "./offer-parse-ClieybKl.js";
//#region src/lib/offer.functions.ts?tss-serverfn-split
var UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
async function fetchText(url, accept) {
	const response = await fetch(url, {
		redirect: "follow",
		headers: {
			"User-Agent": UA,
			Accept: accept,
			"Accept-Language": "en,es;q=0.8"
		},
		signal: AbortSignal.timeout(25e3)
	});
	if (!response.ok) throw new Error(`status ${response.status}`);
	return await response.text();
}
/**
* Try, in order: direct HTML (JSON-LD first, then visible text), then a reader
* proxy that renders JavaScript. Job boards block most of these individually.
*/
async function extractPageText(url) {
	let lastError = "";
	try {
		const html = await fetchText(url, "text/html,application/xhtml+xml");
		const structured = jsonLdOffer(html);
		if (structured.length > 300) return {
			text: structured,
			source: "json-ld",
			error: ""
		};
		const visible = htmlToText(html);
		if (visible.length > 600) return {
			text: visible,
			source: "html",
			error: ""
		};
		lastError = "the page returned almost no readable text";
	} catch (error) {
		lastError = error instanceof Error ? error.message : "the site refused the request";
		console.error("[analyzeOfferUrl] direct fetch failed", error);
	}
	try {
		const text = (await fetchText(`https://r.jina.ai/${url}`, "text/plain")).trim();
		if (text.length > 600) return {
			text,
			source: "reader",
			error: ""
		};
		lastError = "the reader service returned almost no text";
	} catch (error) {
		lastError = error instanceof Error ? error.message : lastError;
		console.error("[analyzeOfferUrl] reader fetch failed", error);
	}
	return {
		text: "",
		source: "",
		error: lastError
	};
}
/** Read a job posting URL and extract the structured offer so the user can confirm it. */
var analyzeOfferUrl_createServerFn_handler = createServerRpc({
	id: "7d7ba122e8d710b83fbd6a865d41d9b46716103b6dda1ea8f8f09eb9a2d6aa74",
	name: "analyzeOfferUrl",
	filename: "src/lib/offer.functions.ts"
}, (opts) => analyzeOfferUrl.__executeServer(opts));
var analyzeOfferUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ url: validateOfferUrl(input.url) })).handler(analyzeOfferUrl_createServerFn_handler, async ({ data, context }) => {
	const extracted = await extractPageText(data.url);
	if (!extracted.text) return failedOffer(data.url, `We could not read that page (${extracted.error || "the site blocked automated readers"}). Many boards such as LinkedIn or Indeed require a login — paste the description below instead.`);
	const text = extracted.text.slice(0, 6e4);
	const { callGateway, parseJsonResponse } = await import("./ai-gateway.server-MwD_wIGi.js").then((n) => n.n);
	const parsed = parseJsonResponse(await callGateway([{
		role: "system",
		content: `You read the raw text of a web page and decide whether it is a single job posting.
Return ONLY JSON:
{
  "isJobOffer": boolean,
  "company": string,
  "roleTitle": string,
  "location": string,
  "employmentType": string,
  "seniority": string,
  "highlights": [string],
  "summary": string,
  "salaryText": string,
  "skills": [string],
  "offerText": string
}
"offerText" is the full cleaned job description (responsibilities, requirements, stack, benefits) with navigation, cookie banners, footers and unrelated listings removed — keep it in the original language of the posting.
"highlights" is 3 to 6 short bullet points a candidate would care about.
"summary" is 2 to 3 sentences describing what the role is about, in English.
"salaryText" is the salary or range exactly as stated, or "" when the posting does not mention pay — never invent a number.
"skills" is up to 8 concrete skills or technologies the offer requires.
Set isJobOffer to false if the page is a search results list, a login wall, or not a job posting. Never invent details.`
	}, {
		role: "user",
		content: `URL: ${data.url}\n\nPAGE TEXT:\n${text}`
	}], {
		json: true,
		feature: "offer_analysis",
		userId: context.userId
	}));
	return buildOfferAnalysis(data.url, parsed);
});
//#endregion
export { analyzeOfferUrl_createServerFn_handler };
