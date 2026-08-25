import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_TEMPLATE, normalizeTemplate, type TemplateSettings } from "@/lib/cv-template";

export const getCvTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cv_templates")
      .select("settings")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const row = data as { settings?: unknown } | null;
    return row ? normalizeTemplate(row.settings) : DEFAULT_TEMPLATE;
  });

export const saveCvTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { settings: TemplateSettings }) => input)
  .handler(async ({ data, context }) => {
    const settings = normalizeTemplate(data.settings);
    const { error } = await context.supabase.from("cv_templates").upsert(
      {
        user_id: context.userId,
        settings,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return settings;
  });

/** Per-application visual override, falling back to the saved default. */
export const setApplicationTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; settings: TemplateSettings | null }) => input)
  .handler(async ({ data, context }) => {
    const settings = data.settings ? normalizeTemplate(data.settings) : null;
    const { error } = await context.supabase
      .from("applications")
      .update({ template_overrides: settings } as never)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return settings;
  });
