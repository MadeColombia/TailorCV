import { normalizeCv, type CvData } from "@/lib/cv";

export const CV_SCHEMA_HINT = `{
  "fullName": string, "email": string, "phone": string, "location": string,
  "links": string, "linkItems": [{ "label": string, "url": string }], "headline": string, "summary": string,
  "experiences": [{ "company": string, "title": string, "location": string, "start": string, "end": string, "bullets": [string] }],
  "education": [{ "school": string, "degree": string, "start": string, "end": string, "details": string }],
  "skills": [string]
}`;

type Db = { from: (table: string) => any };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loadApplication(
  supabase: Db,
  userId: string,
  id: string,
) {
  if (!UUID_RE.test(id)) throw new Error("Application not found");
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Application not found");
  return data;
}

export async function loadProfileCv(
  supabase: Db,
  userId: string,
  language = "en",
): Promise<CvData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("language", language === "es" ? "es" : "en")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeCv({
    fullName: data?.full_name ?? "",
    email: data?.email ?? "",
    phone: data?.phone ?? "",
    location: data?.location ?? "",
    links: data?.links ?? "",
    linkItems: data?.link_items ?? [],
    photoUrl: data?.photo_url ?? "",
    headline: data?.headline ?? "",
    summary: data?.summary ?? "",
    experiences: data?.experiences ?? [],
    education: data?.education ?? [],
    skills: data?.skills ?? [],
  });
}

/** Everything the candidate has already told the AI, across all applications. */
export async function loadKnowledge(supabase: Db, userId: string) {
  const { data } = await supabase
    .from("candidate_knowledge")
    .select("question, answer, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(80);
  return (data ?? []) as Array<{ question: string; answer: string }>;
}

export function knowledgeToText(
  items: Array<{ question: string; answer: string }>,
) {
  if (!items.length) return "(nothing yet)";
  return items
    .map((item) =>
      item.question
        ? `Q: ${item.question}\nA: ${item.answer}`
        : `- ${item.answer}`,
    )
    .join("\n\n");
}
