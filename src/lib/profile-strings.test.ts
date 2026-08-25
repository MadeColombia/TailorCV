import { describe, expect, it } from "vitest";
import { profileStrings } from "./profile-strings";

describe("profileStrings", () => {
  it("returns English copy by default", () => {
    const en = profileStrings("en");
    expect(en.contact).toBe("Contact");
    expect(en.translateFrom("Spanish")).toBe("Translate from Spanish");
    expect(en.languageNames['es']).toBe("Spanish");
  });

  it("returns Spanish copy for the Spanish version", () => {
    const es = profileStrings("es");
    expect(es.contact).toBe("Contacto");
    expect(es.experience).toBe("Experiencia");
    expect(es.download).toBe("Descargar CV");
    expect(es.translateFrom("inglés")).toBe("Traducir desde inglés");
    expect(es.fillOtherFirst("inglés")).toContain("inglés");
    expect(es.languageHint("inglés")).toContain("inglés");
  });

  it("falls back to English for unknown languages", () => {
    expect(profileStrings("fr").title).toBe("Master profile");
    expect(profileStrings(undefined).languageHint("Spanish")).toContain("Spanish");
    expect(profileStrings("en").fillOtherFirst("Spanish")).toBe("Fill in your Spanish profile first");
  });
});
