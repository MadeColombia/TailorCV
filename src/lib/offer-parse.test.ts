import { describe, expect, it } from "vitest";
import {
  buildOfferAnalysis,
  failedOffer,
  findJobPosting,
  htmlToText,
  jsonLdOffer,
  validateOfferUrl,
} from "./offer-parse";

describe("htmlToText", () => {
  it("strips scripts, styles and tags and decodes entities", () => {
    const text = htmlToText(
      `<style>a{}</style><script>bad()</script><noscript>x</noscript><h1>Role</h1><p>Team &amp; &quot;impact&quot;</p><li>5&nbsp;years</li>`,
    );
    expect(text).not.toContain("bad()");
    expect(text).toContain("Role");
    expect(text).toContain('Team & "impact"');
    expect(text).toContain("5 years");
  });

  it("collapses excess blank lines", () => {
    expect(
      htmlToText("<p>a</p><p></p><p></p><p></p><p>b</p>").replace(/ /g, ""),
    ).toBe("a\n\nb");
  });
});

describe("findJobPosting", () => {
  it("finds a posting nested in arrays and graphs", () => {
    const posting = findJobPosting({
      "@graph": [{ "@type": ["JobPosting"], title: "Analyst" }],
    });
    expect(posting?.["title"]).toBe("Analyst");
  });

  it("returns null when there is no posting", () => {
    expect(findJobPosting({ "@type": "Organization" })).toBeNull();
    expect(findJobPosting(null)).toBeNull();
    expect(findJobPosting("string")).toBeNull();
    expect(findJobPosting([])).toBeNull();
  });

  it("stops recursing past the depth limit", () => {
    let node: unknown = { "@type": "JobPosting" };
    for (let i = 0; i < 10; i += 1) node = { child: node };
    expect(findJobPosting(node)).toBeNull();
  });
});

describe("jsonLdOffer", () => {
  const script = (json: unknown) =>
    `<script type="application/ld+json">${JSON.stringify(json)}</script>`;

  it("extracts a rich posting", () => {
    const html = script({
      "@type": "JobPosting",
      title: "Data Analyst",
      hiringOrganization: { name: "ACME" },
      employmentType: ["FULL_TIME", "CONTRACT"],
      jobLocation: { address: "Madrid" },
      description: `<p>${"We need SQL and Python. ".repeat(30)}</p>`,
    });
    const out = jsonLdOffer(html);
    expect(out).toContain("Title: Data Analyst");
    expect(out).toContain("Company: ACME");
    expect(out).toContain("Employment type: FULL_TIME, CONTRACT");
    expect(out).toContain("Location:");
    expect(out).toContain("We need SQL and Python.");
  });

  it("returns empty for malformed, missing or too-short blocks", () => {
    expect(jsonLdOffer("<p>no scripts here</p>")).toBe("");
    expect(
      jsonLdOffer(`<script type="application/ld+json">{oops</script>`),
    ).toBe("");
    expect(jsonLdOffer(script({ "@type": "JobPosting", title: "Short" }))).toBe(
      "",
    );
    expect(jsonLdOffer(script({ "@type": "WebPage" }))).toBe("");
  });
});

describe("validateOfferUrl", () => {
  it("accepts http(s) links", () => {
    expect(validateOfferUrl(" https://jobs.example.com/1 ")).toBe(
      "https://jobs.example.com/1",
    );
  });

  it("rejects anything else", () => {
    expect(() => validateOfferUrl("not a url")).toThrow(/valid job offer link/);
    expect(() => validateOfferUrl(undefined)).toThrow();
    expect(() =>
      validateOfferUrl(`https://x.com/${"a".repeat(2100)}`),
    ).toThrow();
  });

  it("rejects non-http schemes and embedded credentials", () => {
    expect(() => validateOfferUrl("file:///etc/passwd")).toThrow(/http/i);
    expect(() => validateOfferUrl("javascript:alert(1)")).toThrow();
    expect(() =>
      validateOfferUrl("https://user:pass@jobs.example.com/1"),
    ).toThrow();
  });

  it("rejects private and loopback hosts", () => {
    for (const url of [
      "http://localhost:8080/x",
      "http://127.0.0.1/x",
      "http://169.254.169.254/latest/meta-data",
      "http://10.0.0.5/x",
      "http://192.168.1.1/x",
      "http://172.16.0.9/x",
      "http://db.internal/x",
    ]) {
      expect(() => validateOfferUrl(url)).toThrow();
    }
  });
});

describe("buildOfferAnalysis", () => {
  const longText = "Responsibilities and requirements. ".repeat(20);

  it("returns a confirmed offer", () => {
    const result = buildOfferAnalysis("https://x.com/1", {
      isJobOffer: true,
      company: " ACME ",
      roleTitle: "Analyst",
      location: "Madrid",
      employmentType: "Full time",
      seniority: "Mid",
      highlights: ["a", "b", "", "c", "d", "e", "f", "g"],
      offerText: longText,
    });
    expect(result.ok).toBe(true);
    expect(result.company).toBe("ACME");
    expect(result.highlights).toHaveLength(6);
    expect(result.offerText).toContain("Responsibilities");
  });

  it("fails when the page is not an offer or the text is too short", () => {
    expect(
      buildOfferAnalysis("https://x.com/1", {
        isJobOffer: false,
        offerText: longText,
      }).ok,
    ).toBe(false);
    expect(
      buildOfferAnalysis("https://x.com/1", {
        isJobOffer: true,
        offerText: "tiny",
      }).ok,
    ).toBe(false);
  });

  it("defaults missing fields", () => {
    const result = buildOfferAnalysis("https://x.com/1", {
      isJobOffer: true,
      offerText: longText,
    });
    expect(result.roleTitle).toBe("");
    expect(result.highlights).toEqual([]);
  });

  it("builds a failure payload with the reason", () => {
    expect(failedOffer("https://x.com", "blocked")).toMatchObject({
      ok: false,
      reason: "blocked",
      offerText: "",
    });
  });
});
