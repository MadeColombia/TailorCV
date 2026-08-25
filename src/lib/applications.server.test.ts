import { describe, expect, it } from "vitest";
import {
  CV_SCHEMA_HINT,
  knowledgeToText,
  loadApplication,
  loadKnowledge,
  loadProfileCv,
} from "./applications.server";

/** Minimal chainable stub of the Supabase query builder used by these loaders. */
function stubDb(result: {
  data?: unknown;
  error?: { message: string } | null;
}) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const method of ["select", "eq", "order", "limit"])
    builder[method] = chain;
  builder["maybeSingle"] = async () => result;
  builder["then"] = (resolve: (value: unknown) => unknown) =>
    Promise.resolve(result).then(resolve);
  return { from: () => builder } as never;
}

const APP_ID = "11111111-1111-1111-1111-111111111111";
const USER_ID = "22222222-2222-2222-2222-222222222222";

describe("loadApplication", () => {
  it("returns the row", async () => {
    const row = { id: APP_ID, company: "ACME" };
    await expect(
      loadApplication(stubDb({ data: row }), USER_ID, APP_ID),
    ).resolves.toEqual(row);
  });

  it("throws on a query error", async () => {
    await expect(
      loadApplication(stubDb({ error: { message: "boom" } }), USER_ID, APP_ID),
    ).rejects.toThrow("boom");
  });

  it("throws when nothing matches", async () => {
    await expect(
      loadApplication(stubDb({ data: null }), USER_ID, APP_ID),
    ).rejects.toThrow("Application not found");
  });
});

describe("loadProfileCv", () => {
  it("maps snake_case columns into a normalized CV", async () => {
    const cv = await loadProfileCv(
      stubDb({
        data: {
          full_name: "Ada",
          email: "a@b.c",
          link_items: [{ label: "GitHub", url: "https://gh.com" }],
          skills: ["SQL"],
        },
      }),
      "u1",
      "es",
    );
    expect(cv.fullName).toBe("Ada");
    expect(cv.linkItems).toEqual([{ label: "GitHub", url: "https://gh.com" }]);
    expect(cv.skills).toEqual(["SQL"]);
  });

  it("returns an empty CV when no profile exists", async () => {
    const cv = await loadProfileCv(stubDb({ data: null }), "u1");
    expect(cv.fullName).toBe("");
    expect(cv.experiences).toEqual([]);
  });

  it("throws on a query error", async () => {
    await expect(
      loadProfileCv(stubDb({ error: { message: "nope" } }), "u1"),
    ).rejects.toThrow("nope");
  });
});

describe("loadKnowledge", () => {
  it("returns the stored answers", async () => {
    const rows = [{ question: "Q", answer: "A" }];
    await expect(loadKnowledge(stubDb({ data: rows }), "u1")).resolves.toEqual(
      rows,
    );
  });

  it("returns an empty list when there is nothing", async () => {
    await expect(loadKnowledge(stubDb({ data: null }), "u1")).resolves.toEqual(
      [],
    );
  });
});

describe("knowledgeToText", () => {
  it("explains when nothing is known yet", () => {
    expect(knowledgeToText([])).toBe("(nothing yet)");
  });

  it("formats question/answer pairs and bare notes", () => {
    expect(
      knowledgeToText([
        { question: "Years of SQL?", answer: "6" },
        { question: "", answer: "Remote only" },
      ]),
    ).toBe("Q: Years of SQL?\nA: 6\n\n- Remote only");
  });
});

describe("CV_SCHEMA_HINT", () => {
  it("describes every CV field the model must return", () => {
    for (const key of [
      "fullName",
      "linkItems",
      "experiences",
      "education",
      "skills",
    ]) {
      expect(CV_SCHEMA_HINT).toContain(key);
    }
  });
});
