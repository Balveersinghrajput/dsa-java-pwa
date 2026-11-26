import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: { SESSION_SECRET: "test-secret-0123456789-abcdefghijklmnopqrstuvwxyz", ACCOUNT_EMAIL: "tester@example.test" },
  },
});
