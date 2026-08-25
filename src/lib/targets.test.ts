import { describe, expect, it } from "vitest";
import { MAX_TARGETS, targetLanguage } from "./targets";

describe("role targets", () => {
  it("caps the number of saved targets at five", () => {
    expect(MAX_TARGETS).toBe(5);
  });

  it("only accepts the two supported languages", () => {
    expect(targetLanguage("es")).toBe("es");
    expect(targetLanguage("en")).toBe("en");
    expect(targetLanguage(undefined)).toBe("en");
    expect(targetLanguage("fr")).toBe("en");
  });
});
