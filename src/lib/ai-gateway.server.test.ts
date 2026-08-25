import { afterEach, describe, expect, it, vi } from "vitest";
import {
  callGateway,
  parseJsonResponse,
  requireApiKey,
  CHAT_MODEL,
  createAiProvider,
} from "./ai-gateway.server";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env["OPENAI_API_KEY"];
  vi.restoreAllMocks();
});

function mockFetch(
  response: Partial<Response> & { json?: () => Promise<unknown> },
) {
  const fn = vi.fn().mockResolvedValue(response as Response);
  globalThis.fetch = fn as never;
  return fn;
}

describe("requireApiKey", () => {
  it("returns the configured key", () => {
    process.env["OPENAI_API_KEY"] = "key-123";
    expect(requireApiKey()).toBe("key-123");
  });

  it("throws when AI is not configured", () => {
    expect(() => requireApiKey()).toThrow(/not configured/);
  });
});

describe("parseJsonResponse", () => {
  it("parses plain JSON", () => {
    expect(parseJsonResponse<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips code fences and surrounding prose", () => {
    expect(parseJsonResponse('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseJsonResponse('Sure! {"a":2} hope that helps')).toEqual({
      a: 2,
    });
  });

  it("throws on unparseable content", () => {
    expect(() => parseJsonResponse("not json")).toThrow();
  });
});

describe("callGateway", () => {
  it("posts the messages and returns the content", async () => {
    process.env["OPENAI_API_KEY"] = "key-123";
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "hello" } }] }),
    });
    const out = await callGateway([{ role: "user", content: "hi" }], {
      json: true,
    });
    expect(out).toBe("hello");
    const body = JSON.parse(
      (fetchMock.mock.calls[0]![1] as RequestInit).body as string,
    );
    expect(body.model).toBe(CHAT_MODEL);
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.max_tokens).toBe(2000);
  });

  it("applies feature-specific max_tokens", async () => {
    process.env["OPENAI_API_KEY"] = "key-123";
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "hello" } }] }),
    });
    await callGateway([{ role: "user", content: "hi" }], {
      feature: "cover_letter",
    });
    const body = JSON.parse(
      (fetchMock.mock.calls[0]![1] as RequestInit).body as string,
    );
    expect(body.max_tokens).toBe(800);
  });

  it("blocks rapid calls exceeding rate limit", async () => {
    process.env["OPENAI_API_KEY"] = "key-123";
    mockFetch({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "hello" } }] }),
    });
    const userId = "rate-limited-user";
    for (let i = 0; i < 15; i++) {
      await expect(
        callGateway([{ role: "user", content: "hi" }], { userId }),
      ).resolves.toBe("hello");
    }
    await expect(
      callGateway([{ role: "user", content: "hi" }], { userId }),
    ).rejects.toThrow(/AI usage limit reached/);
  });

  it("returns an empty string when the model sends no content", async () => {
    process.env["OPENAI_API_KEY"] = "key-123";
    mockFetch({ ok: true, json: async () => ({}) });
    await expect(callGateway([{ role: "user", content: "hi" }])).resolves.toBe(
      "",
    );
  });

  it.each([
    [429, /busy right now/],
    [402, /credits are exhausted/],
    [500, /AI request failed \(500\)/],
  ])("maps status %i to a friendly error", async (status, message) => {
    process.env["OPENAI_API_KEY"] = "key-123";
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch({ ok: false, status, text: async () => "err" } as never);
    await expect(
      callGateway([{ role: "user", content: "hi" }]),
    ).rejects.toThrow(message);
  });
});

describe("createAiProvider", () => {
  it("builds a provider bound to the gateway", () => {
    expect(typeof createAiProvider("key-123")).toBe("function");
  });
});
