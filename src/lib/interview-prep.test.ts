import { describe, expect, it } from "vitest";
import { normalizeInterviewPrep, prepToPlainText } from "./interview-prep";

describe("normalizeInterviewPrep", () => {
  it("returns an empty list for junk input", () => {
    expect(normalizeInterviewPrep(null)).toEqual({ questions: [] });
    expect(normalizeInterviewPrep({ questions: "nope" })).toEqual({
      questions: [],
    });
  });

  it("normalizes categories and trims fields", () => {
    const prep = normalizeInterviewPrep({
      questions: [
        {
          category: "Behavioral",
          question: " Tell me about a conflict ",
          why: " x ",
          answer: " y ",
        },
        { category: "weird", question: "Why us?" },
        { question: "" },
      ],
    });
    expect(prep.questions).toHaveLength(2);
    expect(prep.questions[0]).toEqual({
      category: "behavioural",
      question: "Tell me about a conflict",
      why: "x",
      answer: "y",
      isGap: false,
    });
    expect(prep.questions[1]!.category).toBe("role");
  });

  it("marks gap questions", () => {
    const prep = normalizeInterviewPrep({
      questions: [
        { category: "gap", question: "No Kubernetes?" },
        { category: "role", question: "Scale?", isGap: true },
      ],
    });
    expect(prep.questions.every((q) => q.isGap)).toBe(true);
  });
});

describe("prepToPlainText", () => {
  it("renders a numbered sheet", () => {
    const text = prepToPlainText({
      questions: [
        {
          category: "company",
          question: "Why us?",
          why: "motivation",
          answer: "Because.",
          isGap: false,
        },
      ],
    });
    expect(text).toContain("1. [Company & motivation] Why us?");
    expect(text).toContain("Answer: Because.");
  });
});
