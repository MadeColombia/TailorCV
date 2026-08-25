import { DEFAULT_SETTINGS, normalizeSettings, settingsToRow, type UserSettings } from "@/lib/user-settings";

type Db = { from: (table: string) => any };

/** Read the caller's preferences, falling back to defaults when unset. */
export async function loadSettings(supabase: Db, userId: string): Promise<UserSettings> {
  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? normalizeSettings(data) : { ...DEFAULT_SETTINGS };
}

/** Upsert the caller's preferences. */
export async function saveSettings(
  supabase: Db,
  userId: string,
  settings: UserSettings,
): Promise<UserSettings> {
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, ...settingsToRow(settings) }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  return settings;
}
