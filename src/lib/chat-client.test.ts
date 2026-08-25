import { describe, expect, it } from "vitest";
import {
  chatMessageText,
  createChatMessage,
  KICKOFF_MESSAGE,
} from "./chat-client";

describe("chat-client", () => {
  it("joins and trims message parts", () => {
    expect(
      chatMessageText({
        id: "1",
        role: "assistant",
        parts: [
          { type: "text", text: " Hello " },
          { type: "text", text: "world " },
        ],
      }),
    ).toBe("Hello world");
  });

  it("returns an empty string for a message with no parts", () => {
    expect(chatMessageText({ id: "1", role: "user", parts: [] })).toBe("");
  });

  it("creates messages with a unique id", () => {
    const a = createChatMessage("user", "hi");
    const b = createChatMessage("assistant", "yo");
    expect(a.id).not.toBe(b.id);
    expect(a.role).toBe("user");
    expect(chatMessageText(b)).toBe("yo");
  });

  it("keeps the hidden kickoff signal stable", () => {
    expect(KICKOFF_MESSAGE).toBe("__kickoff__");
  });
});
