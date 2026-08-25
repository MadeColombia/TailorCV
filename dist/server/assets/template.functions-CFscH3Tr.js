import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { t as createServerRpc } from "./createServerRpc-MBa5GZ-L.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
import { n as DEFAULT_TEMPLATE, u as normalizeTemplate } from "./cv-template-6N3GXnPx.js";
//#region src/lib/template.functions.ts?tss-serverfn-split
var getCvTemplate_createServerFn_handler = createServerRpc({
	id: "dd5cff1e2de6f51ba21b9424ff61bbda7a284db6fe9075c06002fb64df19ef67",
	name: "getCvTemplate",
	filename: "src/lib/template.functions.ts"
}, (opts) => getCvTemplate.__executeServer(opts));
var getCvTemplate = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getCvTemplate_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("cv_templates").select("settings").eq("user_id", context.userId).maybeSingle();
	if (error) throw new Error(error.message);
	const row = data;
	return row ? normalizeTemplate(row.settings) : DEFAULT_TEMPLATE;
});
var saveCvTemplate_createServerFn_handler = createServerRpc({
	id: "b9634c1521befb671aba26d3591b16198be7678e857bc48f047562537f4bcff5",
	name: "saveCvTemplate",
	filename: "src/lib/template.functions.ts"
}, (opts) => saveCvTemplate.__executeServer(opts));
var saveCvTemplate = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(saveCvTemplate_createServerFn_handler, async ({ data, context }) => {
	const settings = normalizeTemplate(data.settings);
	const { error } = await context.supabase.from("cv_templates").upsert({
		user_id: context.userId,
		settings,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id" });
	if (error) throw new Error(error.message);
	return settings;
});
var setApplicationTemplate_createServerFn_handler = createServerRpc({
	id: "9520c56056d5f5da453bbde7d7486fb3219178826092c9aefc8e6d328d5c98c5",
	name: "setApplicationTemplate",
	filename: "src/lib/template.functions.ts"
}, (opts) => setApplicationTemplate.__executeServer(opts));
var setApplicationTemplate = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(setApplicationTemplate_createServerFn_handler, async ({ data, context }) => {
	const settings = data.settings ? normalizeTemplate(data.settings) : null;
	const { error } = await context.supabase.from("applications").update({ template_overrides: settings }).eq("id", data.id).eq("user_id", context.userId);
	if (error) throw new Error(error.message);
	return settings;
});
//#endregion
export { getCvTemplate_createServerFn_handler, saveCvTemplate_createServerFn_handler, setApplicationTemplate_createServerFn_handler };
