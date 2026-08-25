export const PREP_CATEGORIES = [
  "role",
  "company",
  "behavioural",
  "gap",
] as const;
export type PrepCategory = (typeof PREP_CATEGORIES)[number];

export type PrepQuestion = {
  category: PrepCategory;
  question: string;
  why: string;
  answer: string;
  isGap: boolean;
};

export type InterviewPrep = {
  questions: PrepQuestion[];
};

const str = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

function normalizeCategory(value: unknown): PrepCategory {
  const raw = str(value).toLowerCase();
  if (raw === "behavioral") return "behavioural";
  return (PREP_CATEGORIES as readonly string[]).includes(raw)
    ? (raw as PrepCategory)
    : "role";
}

export function normalizeInterviewPrep(input: unknown): InterviewPrep {
  const source = (input ?? {}) as { questions?: unknown };
  const list = Array.isArray(source.questions) ? source.questions : [];
  const questions = list
    .map((item) => {
      const entry = (item ?? {}) as Record<string, unknown>;
      const category = normalizeCategory(entry["category"]);
      return {
        category,
        question: str(entry["question"]),
        why: str(entry["why"]),
        answer: str(entry["answer"]),
        isGap: entry["isGap"] === true || category === "gap",
      };
    })
    .filter((item) => item.question.length > 0);
  return { questions };
}

export const CATEGORY_LABELS: Record<PrepCategory, string> = {
  role: "Role & technical",
  company: "Company & motivation",
  behavioural: "Behavioural",
  gap: "Likely gaps",
};

export function prepToPlainText(prep: InterviewPrep): string {
  return prep.questions
    .map(
      (item, index) =>
        `${index + 1}. [${CATEGORY_LABELS[item.category]}] ${item.question}\nWhy: ${item.why}\nAnswer: ${item.answer}`,
    )
    .join("\n\n");
}
