import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/cv.ts",
        "src/lib/cv-template.ts",
        "src/lib/chat-client.ts",
        "src/lib/targets.ts",
        "src/lib/utils.ts",
        "src/lib/profile-strings.ts",
        "src/lib/offer-parse.ts",
        "src/lib/applications.server.ts",
        "src/lib/ai-gateway.server.ts",
        "src/lib/error-page.ts",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
