import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  // @vitejs/plugin-react v6 uses rolldown-based Vite types; vitest v3 bundles
  // an older rollup-based Vite internally — cast to silence the structural mismatch.
  plugins: [react() as never],
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "http://localhost" } },
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/__tests__/**",
        "src/app/api/**",
        "src/app/layout.tsx",
        "src/app/providers.tsx",
        "src/lib/queryClient.ts",
      ],
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
