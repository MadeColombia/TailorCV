/** Pure HTML/JSON-LD parsing helpers used by the job offer analyzer. */

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

/** Deep-search embedded JSON-LD for a JobPosting node (most boards ship one). */
export function findJobPosting(
  node: unknown,
  depth = 0,
): Record<string, unknown> | null {
  if (!node || depth > 6) return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findJobPosting(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof node !== "object") return null;
  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  const types = Array.isArray(type) ? type.map(String) : [String(type ?? "")];
  if (types.some((t) => t.toLowerCase() === "jobposting")) return obj;
  for (const value of Object.values(obj)) {
    const hit = findJobPosting(value, depth + 1);
    if (hit) return hit;
  }
  return null;
}

export function jsonLdOffer(html: string): string {
  const blocks =
    html.match(
      /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
    ) ?? [];
  for (const block of blocks) {
    const body = block
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "");
    try {
      const posting = findJobPosting(JSON.parse(body));
      if (!posting) continue;
      const parts: string[] = [];
      const push = (label: string, value: unknown) => {
        const text = typeof value === "string" ? value : "";
        if (text.trim()) parts.push(`${label}: ${text.trim()}`);
      };
      push("Title", posting["title"]);
      const org = posting["hiringOrganization"];
      if (org && typeof org === "object")
        push("Company", (org as Record<string, unknown>)["name"]);
      push(
        "Employment type",
        Array.isArray(posting["employmentType"])
          ? (posting["employmentType"] as unknown[]).join(", ")
          : posting["employmentType"],
      );
      const loc = posting["jobLocation"];
      if (loc)
        parts.push(
          `Location: ${htmlToText(JSON.stringify(loc)).slice(0, 300)}`,
        );
      const description = posting["description"];
      if (typeof description === "string")
        parts.push("\n" + htmlToText(description));
      const joined = parts.join("\n");
      if (joined.length > 300) return joined;
    } catch {
      /* malformed block, try the next one */
    }
  }
  return "";
}

const BLOCKED_HOST =
  /^(localhost|127\.|0\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?|\[?f[cd])/i;

/**
 * Validate a pasted job offer link before we fetch it server-side. Rejects
 * non-http(s) schemes, embedded credentials and private/loopback hosts so the
 * fetch cannot be pointed at internal infrastructure (SSRF).
 */
export function validateOfferUrl(input: unknown): string {
  const raw = String(input ?? "").trim();
  if (!raw || raw.length > 2000) {
    throw new Error("That does not look like a valid job offer link.");
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That does not look like a valid job offer link.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https links are supported.");
  }
  if (url.username || url.password) {
    throw new Error("That does not look like a valid job offer link.");
  }
  const host = url.hostname.toLowerCase();
  if (
    !host.includes(".") ||
    BLOCKED_HOST.test(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error(
      "That link points to a private address and cannot be opened.",
    );
  }
  return url.toString();
}

export type OfferAnalysis = {
  ok: boolean;
  reason: string;
  url: string;
  company: string;
  roleTitle: string;
  location: string;
  employmentType: string;
  seniority: string;
  highlights: string[];
  offerText: string;
  summary: string;
  salaryText: string;
  skills: string[];
};

export const failedOffer = (url: string, reason: string): OfferAnalysis => ({
  ok: false,
  reason,
  url,
  company: "",
  roleTitle: "",
  location: "",
  employmentType: "",
  seniority: "",
  highlights: [],
  offerText: "",
  summary: "",
  salaryText: "",
  skills: [],
});

/** Shape the model's JSON into a confirmed offer, or explain why it failed. */
export function buildOfferAnalysis(
  url: string,
  parsed: Record<string, unknown>,
): OfferAnalysis {
  const offerText = String(parsed["offerText"] ?? "").trim();
  if (!parsed["isJobOffer"] || offerText.length < 200) {
    return failedOffer(
      url,
      "We opened the page but could not find a job description on it. Paste the description below instead.",
    );
  }
  return {
    ok: true,
    reason: "",
    url,
    company: String(parsed["company"] ?? "").trim(),
    roleTitle: String(parsed["roleTitle"] ?? "").trim(),
    location: String(parsed["location"] ?? "").trim(),
    employmentType: String(parsed["employmentType"] ?? "").trim(),
    seniority: String(parsed["seniority"] ?? "").trim(),
    highlights: Array.isArray(parsed["highlights"])
      ? (parsed["highlights"] as unknown[])
          .map((item) => String(item))
          .filter(Boolean)
          .slice(0, 6)
      : [],
    offerText,
    summary: String(parsed["summary"] ?? "")
      .trim()
      .slice(0, 700),
    salaryText: String(parsed["salaryText"] ?? parsed["salary"] ?? "")
      .trim()
      .slice(0, 120),
    skills: Array.isArray(parsed["skills"])
      ? (parsed["skills"] as unknown[])
          .map((item) => String(item).trim())
          .filter(Boolean)
          .slice(0, 8)
      : [],
  };
}
