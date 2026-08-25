import { c as createServerFn } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-UH_Jp6hR.mjs";
import { d as normalizeCv } from "./cv-DMqvWRdG.mjs";
import { t as createServerRpc } from "./createServerRpc-MBa5GZ-L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile.functions-D87--vxj.js
var CV_SCHEMA_HINT = `Return ONLY a JSON object with this exact shape:
{
  "fullName": string, "email": string, "phone": string, "location": string,
  "linkItems": [{ "label": string, "url": string }],
  "headline": string, "summary": string,
  "experiences": [{ "company": string, "title": string, "location": string, "start": string, "end": string, "bullets": [string] }],
  "education": [{ "school": string, "degree": string, "start": string, "end": string, "details": string }],
  "skills": [string]
}
"linkItems" labels should be one of LinkedIn, GitHub, Portfolio, Website or a sensible site name.
Use empty strings or empty arrays when information is missing. Never invent facts.`;
var LANGUAGE_NAMES = {
	en: "English",
	es: "Spanish"
};
function lang(value) {
	return value === "es" ? "es" : "en";
}
function rowToCv(row) {
	return normalizeCv({
		fullName: row?.["full_name"] ?? "",
		email: row?.["email"] ?? "",
		phone: row?.["phone"] ?? "",
		location: row?.["location"] ?? "",
		links: row?.["links"] ?? "",
		linkItems: row?.["link_items"] ?? [],
		photoUrl: row?.["photo_url"] ?? "",
		headline: row?.["headline"] ?? "",
		summary: row?.["summary"] ?? "",
		experiences: row?.["experiences"] ?? [],
		education: row?.["education"] ?? [],
		skills: row?.["skills"] ?? []
	});
}
var getProfile_createServerFn_handler = createServerRpc({
	id: "9df9652da79c7ccc337ce62c64dcd11f1800a8eb6e0bd13747650358f67fe4e8",
	name: "getProfile",
	filename: "src/lib/profile.functions.ts"
}, (opts) => getProfile.__executeServer(opts));
var getProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ language: lang(input?.language) })).handler(getProfile_createServerFn_handler, async ({ data, context }) => {
	const { data: rows, error } = await context.supabase.from("profiles").select("*").eq("user_id", context.userId);
	if (error) throw new Error(error.message);
	const all = rows ?? [];
	const row = all.find((item) => item["language"] === data.language);
	const sharedPhoto = all.map((item) => item["photo_url"]).find((url) => typeof url === "string" && url) ?? "";
	const cv = rowToCv(row);
	return {
		language: data.language,
		exists: Boolean(row),
		cv: {
			...cv,
			photoUrl: cv.photoUrl || sharedPhoto
		}
	};
});
var listProfileVersions_createServerFn_handler = createServerRpc({
	id: "b2058c9262bf2a9974141b874658eabbdbb7a82ec9ed396cbbec288097cd7267",
	name: "listProfileVersions",
	filename: "src/lib/profile.functions.ts"
}, (opts) => listProfileVersions.__executeServer(opts));
var listProfileVersions = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listProfileVersions_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("profiles").select("language, full_name, headline, updated_at").eq("user_id", context.userId);
	if (error) throw new Error(error.message);
	return data ?? [];
});
var saveProfile_createServerFn_handler = createServerRpc({
	id: "cbcc924041242dd11e1ad5000167f6d3fdcc014f84f3fe5dca969bb9361d5d65",
	name: "saveProfile",
	filename: "src/lib/profile.functions.ts"
}, (opts) => saveProfile.__executeServer(opts));
var saveProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(saveProfile_createServerFn_handler, async ({ data, context }) => {
	const cv = normalizeCv(data.cv);
	const { error } = await context.supabase.from("profiles").upsert({
		user_id: context.userId,
		language: lang(data.language),
		full_name: cv.fullName,
		email: cv.email,
		phone: cv.phone,
		location: cv.location,
		links: cv.links,
		link_items: cv.linkItems,
		photo_url: cv.photoUrl,
		headline: cv.headline,
		summary: cv.summary,
		experiences: cv.experiences,
		education: cv.education,
		skills: cv.skills
	}, { onConflict: "user_id,language" });
	if (error) throw new Error(error.message);
	const { error: photoError } = await context.supabase.from("profiles").update({ photo_url: cv.photoUrl }).eq("user_id", context.userId);
	if (photoError) throw new Error(photoError.message);
	return { ok: true };
});
var extractCvFromFile_createServerFn_handler = createServerRpc({
	id: "8a537ba8441d63d2f6be38e34dad8fadf34566543511cfc7ceb7dc5a88cfba38",
	name: "extractCvFromFile",
	filename: "src/lib/profile.functions.ts"
}, (opts) => extractCvFromFile.__executeServer(opts));
var extractCvFromFile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(extractCvFromFile_createServerFn_handler, async ({ data }) => {
	const { callGateway, parseJsonResponse } = await import("./ai-gateway.server-D9ENAmpt.mjs").then((n) => n.n);
	const raw = await callGateway([{
		role: "system",
		content: "You extract structured CV data from a résumé document. Keep the original language of the document. " + CV_SCHEMA_HINT
	}, {
		role: "user",
		content: [{
			type: "text",
			text: "Extract every role, bullet point, education entry, link and skill from this CV."
		}, {
			type: "file",
			file: {
				filename: data.filename,
				file_data: data.dataUrl
			}
		}]
	}], { json: true });
	return normalizeCv(parseJsonResponse(raw));
});
var translateProfile_createServerFn_handler = createServerRpc({
	id: "3404311c309f1ed5631d4d98ddbeb66886f0d6eaaec57dd015223e481d95bf4d",
	name: "translateProfile",
	filename: "src/lib/profile.functions.ts"
}, (opts) => translateProfile.__executeServer(opts));
var translateProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(translateProfile_createServerFn_handler, async ({ data, context }) => {
	const { callGateway, parseJsonResponse } = await import("./ai-gateway.server-D9ENAmpt.mjs").then((n) => n.n);
	const from = lang(data.from);
	const to = lang(data.to);
	if (from === to) throw new Error("Pick two different languages.");
	const { data: row, error } = await context.supabase.from("profiles").select("*").eq("user_id", context.userId).eq("language", from).maybeSingle();
	if (error) throw new Error(error.message);
	const source = rowToCv(row);
	if (!source.fullName && source.experiences.length === 0) throw new Error(`Your ${LANGUAGE_NAMES[from]} profile is empty — fill it in first.`);
	const raw = await callGateway([{
		role: "system",
		content: `You translate a CV from ${LANGUAGE_NAMES[from]} into ${LANGUAGE_NAMES[to]}.
Rules:
- Translate summary, headline, job titles, bullet points, degree names and skills naturally, using the professional vocabulary a native recruiter in that language expects. Do not translate literally.
- Keep proper nouns (company names, school names, product names, tools, programming languages) untouched.
- Keep email, phone, URLs, dates and locations exactly as they are.
- Keep the same structure, order and number of entries and bullets.
${CV_SCHEMA_HINT}`
	}, {
		role: "user",
		content: JSON.stringify(source)
	}], { json: true });
	const translated = normalizeCv({
		...parseJsonResponse(raw),
		photoUrl: source.photoUrl,
		linkItems: source.linkItems
	});
	const { error: saveError } = await context.supabase.from("profiles").upsert({
		user_id: context.userId,
		language: to,
		full_name: translated.fullName,
		email: translated.email,
		phone: translated.phone,
		location: translated.location,
		links: translated.links,
		link_items: translated.linkItems,
		photo_url: translated.photoUrl,
		headline: translated.headline,
		summary: translated.summary,
		experiences: translated.experiences,
		education: translated.education,
		skills: translated.skills
	}, { onConflict: "user_id,language" });
	if (saveError) throw new Error(saveError.message);
	return translated;
});
//#endregion
export { extractCvFromFile_createServerFn_handler, getProfile_createServerFn_handler, listProfileVersions_createServerFn_handler, saveProfile_createServerFn_handler, translateProfile_createServerFn_handler };
