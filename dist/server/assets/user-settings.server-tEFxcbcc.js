import { n as DEFAULT_SETTINGS, s as normalizeSettings, u as settingsToRow } from "./user-settings-BzcLPF0g.js";
//#region src/lib/user-settings.server.ts
/** Read the caller's preferences, falling back to defaults when unset. */
async function loadSettings(supabase, userId) {
	const { data } = await supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle();
	return data ? normalizeSettings(data) : { ...DEFAULT_SETTINGS };
}
/** Upsert the caller's preferences. */
async function saveSettings(supabase, userId, settings) {
	const { error } = await supabase.from("user_settings").upsert({
		user_id: userId,
		...settingsToRow(settings)
	}, { onConflict: "user_id" });
	if (error) throw new Error(error.message);
	return settings;
}
//#endregion
export { loadSettings, saveSettings };
