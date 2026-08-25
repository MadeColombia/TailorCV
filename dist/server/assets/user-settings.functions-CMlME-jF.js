import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { t as createServerRpc } from "./createServerRpc-MBa5GZ-L.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
import { s as normalizeSettings } from "./user-settings-BzcLPF0g.js";
//#region src/lib/user-settings.functions.ts?tss-serverfn-split
/** Read the caller's preferences (creating nothing — defaults are virtual). */
var getUserSettings_createServerFn_handler = createServerRpc({
	id: "8f4f889997e8ec556e3e42ccefde4ee0736b76bf2f84c188e50b5136eea7e3b8",
	name: "getUserSettings",
	filename: "src/lib/user-settings.functions.ts"
}, (opts) => getUserSettings.__executeServer(opts));
var getUserSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getUserSettings_createServerFn_handler, async ({ context }) => {
	const { loadSettings } = await import("./user-settings.server-tEFxcbcc.js");
	return loadSettings(context.supabase, context.userId);
});
var updateUserSettings_createServerFn_handler = createServerRpc({
	id: "999f53238c1f2363f7601b7bc8fc1599eb23d53cc2a335a228cf231e46dd59c1",
	name: "updateUserSettings",
	filename: "src/lib/user-settings.functions.ts"
}, (opts) => updateUserSettings.__executeServer(opts));
var updateUserSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(updateUserSettings_createServerFn_handler, async ({ data, context }) => {
	const { loadSettings, saveSettings } = await import("./user-settings.server-tEFxcbcc.js");
	const current = await loadSettings(context.supabase, context.userId);
	const merged = normalizeSettings({
		...current,
		...data
	});
	return saveSettings(context.supabase, context.userId, merged);
});
var enforceContextRetention_createServerFn_handler = createServerRpc({
	id: "29f0ee964d4e602487b118562d64a01783924290d33af7424841263c6149077c",
	name: "enforceContextRetention",
	filename: "src/lib/user-settings.functions.ts"
}, (opts) => enforceContextRetention.__executeServer(opts));
var enforceContextRetention = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(enforceContextRetention_createServerFn_handler, async ({ context }) => {
	const { loadSettings } = await import("./user-settings.server-tEFxcbcc.js");
	const { isContextExpired } = await import("./user-settings-BzcLPF0g.js").then((n) => n.d);
	const settings = await loadSettings(context.supabase, context.userId);
	if (!settings.autoDeleteEnabled) return {
		erased: false,
		expiresAt: null
	};
	const { data } = await context.supabase.from("candidate_dossier").select("updated_at").eq("user_id", context.userId).maybeSingle();
	const updatedAt = data?.updated_at ?? null;
	if (!updatedAt) return {
		erased: false,
		expiresAt: null
	};
	if (isContextExpired(settings, updatedAt)) {
		const { eraseDossier } = await import("./dossier.server-CI5-kSib.js");
		await eraseDossier(context.supabase, context.userId);
		await context.supabase.from("candidate_knowledge").delete().eq("user_id", context.userId);
		return {
			erased: true,
			expiresAt: null
		};
	}
	return {
		erased: false,
		expiresAt: new Date(Date.parse(updatedAt) + settings.autoDeleteMonths * 30 * 24 * 60 * 60 * 1e3).toISOString()
	};
});
var exportAccountArchive_createServerFn_handler = createServerRpc({
	id: "f527afc0403cdbb78590da889fb40cf02eda91d267d3c35e884d0dcde00a9330",
	name: "exportAccountArchive",
	filename: "src/lib/user-settings.functions.ts"
}, (opts) => exportAccountArchive.__executeServer(opts));
var exportAccountArchive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(exportAccountArchive_createServerFn_handler, async ({ context }) => {
	if (context.claims["aal"] !== "aal2") throw new Error("Two-factor verification required. Confirm your authenticator code before exporting.");
	const { supabase, userId } = context;
	const [profiles, applications, targets, templates, knowledge, settings, parts] = await Promise.all([
		supabase.from("profiles").select("*").eq("user_id", userId),
		supabase.from("applications").select("*").eq("user_id", userId),
		supabase.from("role_targets").select("*").eq("user_id", userId),
		supabase.from("cv_templates").select("*").eq("user_id", userId),
		supabase.from("candidate_knowledge").select("*").eq("user_id", userId),
		import("./user-settings.server-tEFxcbcc.js").then((m) => m.loadSettings(supabase, userId)),
		import("./dossier.server-CI5-kSib.js").then((m) => m.loadDossierParts(supabase, userId))
	]);
	const enc = new TextEncoder();
	const files = {};
	const put = (name, body) => {
		files[name] = enc.encode(body);
	};
	put("README.md", `# TailorCV account export\n\nExported ${(/* @__PURE__ */ new Date()).toISOString()}.\n\nThis archive contains every piece of data stored for your account: master profile versions, applications with tailored CVs and cover letters, role targets, CV templates, your saved career context and your settings.\n`);
	put("profiles.json", JSON.stringify(profiles.data ?? [], null, 2));
	put("applications.json", JSON.stringify(applications.data ?? [], null, 2));
	put("role-targets.json", JSON.stringify(targets.data ?? [], null, 2));
	put("cv-templates.json", JSON.stringify(templates.data ?? [], null, 2));
	put("question-answers.json", JSON.stringify(knowledge.data ?? [], null, 2));
	put("settings.json", JSON.stringify(settings, null, 2));
	put("context/learned-dossier.md", parts.learned || "(nothing recorded yet)");
	if (parts.uploaded) put(`context/uploaded-${parts.uploadedName || "context"}.md`, parts.uploaded);
	for (const row of applications.data ?? []) if (row["cover_letter"]) put(`cover-letters/${`${row["company"] || "company"}-${row["role_title"] || "role"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || row["id"]}.md`, String(row["cover_letter"]));
	const { zipSync } = await import("fflate");
	const zipped = zipSync(files, { level: 6 });
	let binary = "";
	for (let i = 0; i < zipped.length; i += 32768) binary += String.fromCharCode(...zipped.subarray(i, i + 32768));
	return {
		filename: `tailorcv-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.zip`,
		base64: btoa(binary)
	};
});
//#endregion
export { enforceContextRetention_createServerFn_handler, exportAccountArchive_createServerFn_handler, getUserSettings_createServerFn_handler, updateUserSettings_createServerFn_handler };
