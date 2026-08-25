import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeCv, normalizeMatch } from "@/lib/cv";
import {
  CV_SCHEMA_HINT,
  knowledgeToText,
  loadKnowledge,
  loadProfileCv,
} from "@/lib/applications.server";
import { MAX_TARGETS, targetLanguage as lang, type RoleTargetInput } from "@/lib/targets";

export const listRoleTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("role_targets")
      .select("id, title, seniority, location, industry, language, match_result, generated_cv, updated_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getRoleTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("role_targets")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Role target not found");
    return row;
  });

export const createRoleTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RoleTargetInput) => input)
  .handler(async ({ data, context }) => {
    const { count, error: countError } = await context.supabase
      .from("role_targets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= MAX_TARGETS) {
      throw new Error(`You can keep up to ${MAX_TARGETS} role targets — delete one first.`);
    }

    const { data: row, error } = await context.supabase
      .from("role_targets")
      .insert({
        user_id: context.userId,
        title: data.title,
        seniority: data.seniority ?? "",
        location: data.location ?? "",
        industry: data.industry ?? "",
        keywords: data.keywords ?? [],
        sample_offers: data.sampleOffers ?? "",
        language: lang(data.language),
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const updateRoleTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string } & Partial<RoleTargetInput> & { generatedCv?: unknown }) => input)
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch['title'] = data.title;
    if (data.seniority !== undefined) patch['seniority'] = data.seniority;
    if (data.location !== undefined) patch['location'] = data.location;
    if (data.industry !== undefined) patch['industry'] = data.industry;
    if (data.keywords !== undefined) patch['keywords'] = data.keywords;
    if (data.sampleOffers !== undefined) patch['sample_offers'] = data.sampleOffers;
    if (data.language !== undefined) patch['language'] = lang(data.language);
    if (data.generatedCv !== undefined) patch['generated_cv'] = normalizeCv(data.generatedCv);

    const { error } = await context.supabase
      .from("role_targets")
      .update(patch as never)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRoleTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("role_targets")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Build a general, role-focused CV (not tied to one job ad) plus a readiness score. */
export const generateTargetCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { callGateway, parseJsonResponse } = await import("@/lib/ai-gateway.server");

    const { data: row, error: loadError } = await context.supabase
      .from("role_targets")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (loadError) throw new Error(loadError.message);
    if (!row) throw new Error("Role target not found");

    const target = row as Record<string, any>;
    const language = lang(target['language']);
    const profile = await loadProfileCv(context.supabase, context.userId, language);
    if (!profile.fullName && profile.experiences.length === 0) {
      throw new Error("Add your master profile first — the AI has nothing to tailor.");
    }
    const knowledge = await loadKnowledge(context.supabase, context.userId);
    const { loadDossier } = await import("@/lib/dossier.server");
    const { dossierToPrompt } = await import("@/lib/dossier");
    const dossier = await loadDossier(context.supabase, context.userId);
    const keywords: string[] = Array.isArray(target['keywords']) ? target['keywords'] : [];

    const raw = await callGateway(
      [
        {
          role: "system",
          content: `You are an expert ATS résumé writer. Write a GENERAL-PURPOSE CV for one target role — it is not tied to a single job ad, so it must read well for any posting of that role.
Rules:
- First infer the requirements, tools and vocabulary that postings for this role typically ask for (use the sample ads if provided, plus your own knowledge of the role and market).
- Never invent employers, dates, degrees or achievements. Only rephrase, reorder and emphasise what the candidate provided.
- Use the standard terminology of that role wherever it is truthful, so keyword-based filters match.
- Every experience bullet starts with a strong past-tense verb, is one line, and includes a metric when the candidate gave one.
- The CV MUST fit on a single A4 page — multi-page CVs get discarded. Budget roughly: summary max 3 lines, at most 4 roles (compress older ones), 3-5 bullets for the top role and 2-3 for the rest, each bullet about 120 characters, at most 15 skills.
- Skills must be a flat list of concrete keywords, ordered by relevance to the target role.
- Write the whole CV in ${language === "es" ? "Spanish" : "English"}.
Return ONLY a JSON object: { "cv": ${CV_SCHEMA_HINT}, "match": { "score": number 0-100, "matched": [string], "missing": [string], "notes": string } }
"matched" are role keywords the CV credibly demonstrates, "missing" are keywords the role usually demands that the candidate cannot truthfully claim yet, "notes" is one short paragraph of advice on closing the gap.`,
        },
        {
          role: "user",
          content: `TARGET ROLE: ${target['title'] || "unknown"}
SENIORITY: ${target['seniority'] || "(not specified)"}
LOCATION / WORK MODE: ${target['location'] || "(not specified)"}
INDUSTRY: ${target['industry'] || "(not specified)"}
KEYWORDS TO EMPHASISE: ${keywords.join(", ") || "(none given)"}

SAMPLE JOB ADS FOR THIS ROLE (may be empty):
${target['sample_offers'] || "(none given)"}

CANDIDATE MASTER PROFILE (JSON):
${JSON.stringify(profile)}

CANDIDATE DOSSIER (living record of everything they have told us — treat as true, reuse where relevant):
${dossierToPrompt(dossier)}

RAW Q&A LOG (may repeat the dossier):
${knowledgeToText(knowledge)}`,
        },
      ],
      { json: true },
    );

    const parsed = parseJsonResponse<{ cv: unknown; match: unknown }>(raw);
    const cv = normalizeCv(parsed.cv);
    const match = normalizeMatch(parsed.match);

    const { error } = await context.supabase
      .from("role_targets")
      .update({ generated_cv: cv, match_result: match } as never)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);

    return { cv, match };
  });
