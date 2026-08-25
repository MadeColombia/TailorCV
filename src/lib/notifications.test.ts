/**
 * Runs in node: stub a minimal window with localStorage before importing.
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
const store = new Map<string, string>();
const fakeWindow = {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    clear: () => store.clear(),
  },
};
vi.stubGlobal("window", fakeWindow);

const {
  defaultNotificationPrefs,
  loadNotificationPrefs,
  notify,
  saveNotificationPrefs,
} = await import("@/lib/notifications");

describe("notification preferences", () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", fakeWindow);
  });

  it("returns defaults when nothing is stored", () => {
    expect(loadNotificationPrefs()).toEqual(defaultNotificationPrefs);
  });

  it("round-trips saved preferences", () => {
    saveNotificationPrefs({ ...defaultNotificationPrefs, enabled: true, errors: false });
    const prefs = loadNotificationPrefs();
    expect(prefs.enabled).toBe(true);
    expect(prefs.errors).toBe(false);
  });

  it("falls back to defaults on corrupt storage", () => {
    store.set("tailorcv.notifications", "{not json");
    expect(loadNotificationPrefs()).toEqual(defaultNotificationPrefs);
  });

  it("does not fire when disabled", () => {
    const ctor = vi.fn();
    vi.stubGlobal("Notification", Object.assign(ctor, { permission: "granted" }));
    (fakeWindow as Record<string, unknown>)["Notification"] = ctor;
    saveNotificationPrefs({ ...defaultNotificationPrefs, enabled: false });
    notify("cv_tailored", "hi");
    expect(ctor).not.toHaveBeenCalled();
  });

  it("fires for an opted-in event when permission is granted", () => {
    const ctor = vi.fn();
    vi.stubGlobal("Notification", Object.assign(ctor, { permission: "granted" }));
    (fakeWindow as Record<string, unknown>)["Notification"] = ctor;
    saveNotificationPrefs({ ...defaultNotificationPrefs, enabled: true });
    notify("cover_letter", "Ready", "body");
    expect(ctor).toHaveBeenCalledWith("Ready", expect.objectContaining({ body: "body" }));
  });

  it("stays silent when the event type is muted", () => {
    const ctor = vi.fn();
    vi.stubGlobal("Notification", Object.assign(ctor, { permission: "granted" }));
    (fakeWindow as Record<string, unknown>)["Notification"] = ctor;
    saveNotificationPrefs({ ...defaultNotificationPrefs, enabled: true, errors: false });
    notify("errors", "Boom");
    expect(ctor).not.toHaveBeenCalled();
  });
});
