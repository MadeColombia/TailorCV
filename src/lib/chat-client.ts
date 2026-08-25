export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  parts: Array<{ type: "text"; text: string }>;
};

export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

export const KICKOFF_MESSAGE = "__kickoff__";

export function chatMessageText(message: ChatMessage) {
  return message.parts.map((part) => part.text).join("").trim();
}

export function createChatMessage(role: ChatRole, text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    parts: [{ type: "text", text }],
  };
}