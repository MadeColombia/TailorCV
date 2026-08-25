import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeSettings, type UserSettings } from "@/lib/user-settings";

/** Read the caller's preferences (creating nothing — defaults are virtual). */
export const getUserSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadSettings } = await import("@/lib/user-settings.server");
    return loadSettings(context.supabase, context.userId);
  });

/** Persist a full settings object (the client always sends the merged state). */
export const updateUserSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<UserSettings>) => input)
  .handler(async ({ data, context }) => {
    const { loadSettings, saveSettings } =
      await import("@/lib/user-settings.server");
    const current = await loadSettings(context.supabase, context.userId);
    const merged = normalizeSettings({ ...current, ...data });
    return saveSettings(context.supabase, context.userId, merged);
  });

/**
 * Apply the retention setting: when the saved context has not been touched for
 * longer than the chosen window, erase it. Runs whenever settings are read by
 * the app, so no scheduler is required.
 */
export const enforceContextRetention = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadSettings } = await import("@/lib/user-settings.server");
    const { isContextExpired } = await import("@/lib/user-settings");
    const settings = await loadSettings(context.supabase, context.userId);
    if (!settings.autoDeleteEnabled)
      return { erased: false, expiresAt: null as string | null };

    const { data } = await context.supabase
      .from("candidate_dossier")
      .select("updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    const updatedAt =
      (data as { updated_at?: string } | null)?.updated_at ?? null;
    if (!updatedAt) return { erased: false, expiresAt: null };

    if (isContextExpired(settings, updatedAt)) {
      const { eraseDossier } = await import("@/lib/dossier.server");
      await eraseDossier(context.supabase, context.userId);
      await context.supabase
        .from("candidate_knowledge")
        .delete()
        .eq("user_id", context.userId);
      return { erased: true, expiresAt: null };
    }
    const expiresAt = new Date(
      Date.parse(updatedAt) +
        settings.autoDeleteMonths * 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    return { erased: false, expiresAt };
  });

/**
 * Full account export as a zip. Sensitive enough that we require a session
 * that has passed two-factor authentication (AAL2) — a stolen password alone
 * can never pull the whole archive.
 */
export const exportAccountArchive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const aal = (context.claims as Record<string, unknown>)["aal"];
    if (aal !== "aal2") {
      throw new Error(
        "Two-factor verification required. Confirm your authenticator code before exporting.",
      );
    }

    const { supabase, userId } = context;
    const [
      profiles,
      applications,
      targets,
      templates,
      knowledge,
      settings,
      parts,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId),
      supabase.from("applications").select("*").eq("user_id", userId),
      supabase.from("role_targets").select("*").eq("user_id", userId),
      supabase.from("cv_templates").select("*").eq("user_id", userId),
      supabase.from("candidate_knowledge").select("*").eq("user_id", userId),
      import("@/lib/user-settings.server").then((m) =>
        m.loadSettings(supabase, userId),
      ),
      import("@/lib/dossier.server").then((m) =>
        m.loadDossierParts(supabase, userId),
      ),
    ]);

    const enc = new TextEncoder();
    const files: Record<string, Uint8Array> = {};
    const put = (name: string, body: string) => {
      files[name] = enc.encode(body);
    };

    put(
      "README.md",
      `# TailorCV account export\n\nExported ${new Date().toISOString()}.\n\nThis archive contains every piece of data stored for your account: master profile versions, applications with tailored CVs and cover letters, role targets, CV templates, your saved career context and your settings.\n`,
    );
    put("profiles.json", JSON.stringify(profiles.data ?? [], null, 2));
    put("applications.json", JSON.stringify(applications.data ?? [], null, 2));
    put("role-targets.json", JSON.stringify(targets.data ?? [], null, 2));
    put("cv-templates.json", JSON.stringify(templates.data ?? [], null, 2));
    put("question-answers.json", JSON.stringify(knowledge.data ?? [], null, 2));
    put("settings.json", JSON.stringify(settings, null, 2));
    put(
      "context/learned-dossier.md",
      parts.learned || "(nothing recorded yet)",
    );
    if (parts.uploaded) {
      put(
        `context/uploaded-${parts.uploadedName || "context"}.md`,
        parts.uploaded,
      );
    }
    for (const row of (applications.data ?? []) as Array<Record<string, any>>) {
      if (row["cover_letter"]) {
        const slug =
          `${row["company"] || "company"}-${row["role_title"] || "role"}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 60);
        put(
          `cover-letters/${slug || row["id"]}.md`,
          String(row["cover_letter"]),
        );
      }
    }

    const { zipSync } = await import("fflate");
    const zipped = zipSync(files, { level: 6 });
    let binary = "";
    for (let i = 0; i < zipped.length; i += 0x8000) {
      binary += String.fromCharCode(...zipped.subarray(i, i + 0x8000));
    }
    return {
      filename: `tailorcv-export-${new Date().toISOString().slice(0, 10)}.zip`,
      base64: btoa(binary),
    };
  });
