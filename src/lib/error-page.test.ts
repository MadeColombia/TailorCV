import { describe, expect, it } from "vitest";
import { renderErrorPage } from "./error-page";

describe("renderErrorPage", () => {
  it("returns a self-contained HTML document", () => {
    const html = renderErrorPage();
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
    expect(html.length).toBeGreaterThan(50);
  });
});
