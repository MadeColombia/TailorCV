import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeCv, type CvData, type ProfileLanguage } from "@/lib/cv";

const CV_SCHEMA_HINT = `Return ONLY a JSON object with this exact shape:
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

const LANGUAGE_NAMES: Record<string, string> = { en: "English", es: "Spanish" };

function lang(value: unknown): ProfileLanguage {
  return value === "es" ? "es" : "en";
}

function rowToCv(row: Record<string, unknown> | null | undefined): CvData {
  return normalizeCv({
    fullName: row?.['full_name'] ?? "",
    email: row?.['email'] ?? "",
    phone: row?.['phone'] ?? "",
    location: row?.['location'] ?? "",
    links: row?.['links'] ?? "",
    linkItems: row?.['link_items'] ?? [],
    photoUrl: row?.['photo_url'] ?? "",
    headline: row?.['headline'] ?? "",
    summary: row?.['summary'] ?? "",
    experiences: row?.['experiences'] ?? [],
    education: row?.['education'] ?? [],
    skills: row?.['skills'] ?? [],
  });
}

export const getProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { language?: string } | undefined) => ({ language: lang(input?.language) }))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const all = (rows ?? []) as Array<Record<string, unknown>>;
    const row = all.find((item) => item['language'] === data.language);
    // The profile photo is shared across every language version.
    const sharedPhoto = all.map((item) => item['photo_url']).find((url) => typeof url === "string" && url) ?? "";
    const cv = rowToCv(row as never);
    return {
      language: data.language,
      exists: Boolean(row),
      cv: { ...cv, photoUrl: cv.photoUrl || (sharedPhoto as string) },
    };
  });


/** Which language versions the user has actually filled in. */
export const listProfileVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("language, full_name, headline, updated_at")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { language: string; cv: CvData }) => input)
  .handler(async ({ data, context }) => {
    const cv = normalizeCv(data.cv);
    const { error } = await context.supabase.from("profiles").upsert(
      {
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
        skills: cv.skills,
      } as never,
      { onConflict: "user_id,language" },
    );
    if (error) throw new Error(error.message);
    // Keep the photo identical across every language version of the profile.
    const { error: photoError } = await context.supabase
      .from("profiles")
      .update({ photo_url: cv.photoUrl } as never)
      .eq("user_id", context.userId);
    if (photoError) throw new Error(photoError.message);
    return { ok: true };
  });

export const extractCvFromFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { filename: string; dataUrl: string }) => input)
  .handler(async ({ data }) => {
    const { callGateway, parseJsonResponse } = await import("@/lib/ai-gateway.server");
    const raw = await callGateway(
      [
        {
          role: "system",
          content:
            "You extract structured CV data from a résumé document. Keep the original language of the document. " +
            CV_SCHEMA_HINT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract every role, bullet point, education entry, link and skill from this CV.",
            },
            {
              type: "file",
              file: { filename: data.filename, file_data: data.dataUrl },
            },
          ],
        },
      ],
      { json: true },
    );
    return normalizeCv(parseJsonResponse(raw));
  });

/** Translate one saved profile version into another language and save it. */
export const translateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { from: string; to: string }) => input)
  .handler(async ({ data, context }) => {
    const { callGateway, parseJsonResponse } = await import("@/lib/ai-gateway.server");
    const from = lang(data.from);
    const to = lang(data.to);
    if (from === to) throw new Error("Pick two different languages.");

    const { data: row, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", context.userId)
      .eq("language", from)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const source = rowToCv(row as never);
    if (!source.fullName && source.experiences.length === 0) {
      throw new Error(`Your ${LANGUAGE_NAMES[from]} profile is empty — fill it in first.`);
    }

    const raw = await callGateway(
      [
        {
          role: "system",
          content: `You translate a CV from ${LANGUAGE_NAMES[from]} into ${LANGUAGE_NAMES[to]}.
Rules:
- Translate summary, headline, job titles, bullet points, degree names and skills naturally, using the professional vocabulary a native recruiter in that language expects. Do not translate literally.
- Keep proper nouns (company names, school names, product names, tools, programming languages) untouched.
- Keep email, phone, URLs, dates and locations exactly as they are.
- Keep the same structure, order and number of entries and bullets.
${CV_SCHEMA_HINT}`,
        },
        { role: "user", content: JSON.stringify(source) },
      ],
      { json: true },
    );

    const translated = normalizeCv({
      ...parseJsonResponse<Record<string, unknown>>(raw),
      photoUrl: source.photoUrl,
      linkItems: source.linkItems,
    });

    const { error: saveError } = await context.supabase.from("profiles").upsert(
      {
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
        skills: translated.skills,
      } as never,
      { onConflict: "user_id,language" },
    );
    if (saveError) throw new Error(saveError.message);

    return translated;
  });
