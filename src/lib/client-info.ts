/** App build identity + device/browser diagnostics attached to issue reports. */
export const APP_VERSION = "1.0.0";
export const APP_BUILD =
  (import.meta.env?.["VITE_APP_BUILD"] as string | undefined) ?? "dev";

export type ClientInfo = {
  appVersion: string;
  appBuild: string;
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: string;
  screen: string;
  viewport: string;
  pixelRatio: number;
  language: string;
  timezone: string;
  online: boolean;
  reportedAt: string;
  userAgent: string;
};

function detectBrowser(ua: string): { name: string; version: string } {
  const tests: Array<[string, RegExp]> = [
    ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ["Opera", /OPR\/([\d.]+)/],
    ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
    ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
    ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/],
  ];
  for (const [name, pattern] of tests) {
    const match = ua.match(pattern);
    if (match) return { name, version: match[1] ?? "" };
  }
  return { name: "Unknown", version: "" };
}

function detectOs(ua: string): string {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows/.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/.test(ua)) {
    const version = ua.match(/OS (\d+[_\d]*)/)?.[1]?.replace(/_/g, ".");
    return `iOS${version ? ` ${version}` : ""}`;
  }
  if (/Mac OS X/.test(ua)) {
    const version = ua.match(/Mac OS X (\d+[_\d]*)/)?.[1]?.replace(/_/g, ".");
    return `macOS${version ? ` ${version}` : ""}`;
  }
  if (/Android/.test(ua)) {
    const version = ua.match(/Android (\d+[.\d]*)/)?.[1];
    return `Android${version ? ` ${version}` : ""}`;
  }
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function detectDeviceType(ua: string): string {
  if (/iPad|Tablet/.test(ua)) return "tablet";
  if (/Mobi|iPhone|Android.*Mobile/.test(ua)) return "mobile";
  return "desktop";
}

/** Collect non-sensitive environment details for a support ticket. */
export function collectClientInfo(): ClientInfo {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return {
      appVersion: APP_VERSION,
      appBuild: APP_BUILD,
      browser: "Unknown",
      browserVersion: "",
      os: "Unknown",
      deviceType: "unknown",
      screen: "",
      viewport: "",
      pixelRatio: 1,
      language: "",
      timezone: "",
      online: true,
      reportedAt: new Date().toISOString(),
      userAgent: "",
    };
  }
  const ua = navigator.userAgent;
  const browser = detectBrowser(ua);
  return {
    appVersion: APP_VERSION,
    appBuild: APP_BUILD,
    browser: browser.name,
    browserVersion: browser.version,
    os: detectOs(ua),
    deviceType: detectDeviceType(ua),
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio ?? 1,
    language: navigator.language ?? "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    online: navigator.onLine,
    reportedAt: new Date().toISOString(),
    userAgent: ua.slice(0, 400),
  };
}
