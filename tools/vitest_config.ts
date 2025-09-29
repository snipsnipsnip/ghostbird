import { join } from "node:path"
import type { ViteUserConfig } from "vitest/config"

export const config: ViteUserConfig = {
  appType: "custom",
  cacheDir: ".cache/vitest",
  server: {
    watch: {
      ignored: ["**/dist/**", "**/build/**"],
    },
  },
  resolve: {
    alias: {
      src: join(__dirname, "../src"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "test",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "src",
          include: [],
          includeSource: ["src/**/*.ts"],
          exclude: ["src/**/*.test.ts"],
        },
      },
    ],
    env: {
      // biome-ignore lint/style/useNamingConvention: It's a constant
      OUTPUT_DIR: join(__dirname, "../build/test/"),
    },
    reporters: ["default", "junit"],
    outputFile: {
      junit: join(__dirname, "../build/test/result.xml"),
    },
    testTimeout: 20000,
    environment: "jsdom",
  },
}
