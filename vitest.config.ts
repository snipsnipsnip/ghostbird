/**
 * @file Vitest configuration file
 * We want to edit the configuration under tools/ for the convenience of type-checking,
 * but placing the config elsewhere makes Vitest unhappy.
 * Luckily re-exporting works.
 */

// biome-ignore lint/style/noDefaultExport: Vitest requires it
export { config as default } from "./tools/vitest_config"
