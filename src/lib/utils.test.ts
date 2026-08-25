import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges conditional class names", () => {
    expect(cn("p-2", (false as boolean) && "hidden", ["text-sm", null])).toBe(
      "p-2 text-sm",
    );
  });

  it("lets later tailwind utilities win", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
