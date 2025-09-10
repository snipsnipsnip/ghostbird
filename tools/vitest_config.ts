import type { ViteUserConfig } from "vitest/config"

export const config: ViteUserConfig = {
  appType: "custom",
  cacheDir: ".cache/vitest",
  server: {
    watch: {
      ignored: ["**/dist/**", "**/build/**"],
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
      OUTPUT_DIR: "build/test/",
    },
    reporters: ["default", "junit"],
    outputFile: {
      junit: "build/test/result.xml",
    },
    testTimeout: 20000,
    environment: "jsdom",
  },
}
