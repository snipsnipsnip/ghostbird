/**
 * @file Utility functions for tests.
 * Use of node.js functions should be limited to this module so that test cases can concentrate on the logic being
 * tested rather than on dealing with the environment.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { env } from "node:process"
import { parse } from "@std/toml"
import type { LocalesTomlContent } from "src/util/types"

/**
 * Create a text file in the directory configured in `vitest.config.ts`.
 * @param path Relative path to the test output directory configured in `vitest.config.ts`.
 * @param data File content.
 */
export async function writeText(path: string, data: string): Promise<void> {
  let dir = env.OUTPUT_DIR
  if (!dir) {
    throw Error("OUTPUT_DIR is not set")
  }
  const dest = join(dir, path)

  await mkdir(dirname(dest), { recursive: true })
  await writeFile(dest, data)
  console.log(`written ${dest}`)
}

/**
 * Loads a text file
 * @param path Relative path to the directory containing this module.
 */
export function loadText(path: string): Promise<string> {
  return readFile(join(__dirname, path), { encoding: "utf8" })
}

/**
 * Loads a TOML file
 * @param tomlPath Relative path to the directory containing this module.
 */
async function loadToml(tomlPath: string): Promise<Record<string, unknown>> {
  let tomlText = await loadText(tomlPath)
  return parse(tomlText)
}

/**
 * Loads `locales.toml`
 */
export function loadLocalesToml(): Promise<LocalesTomlContent> {
  return loadToml("../../locales.toml") as Promise<LocalesTomlContent>
}

/**
 * Loads `options.css`
 */
export function loadOptionsCss(): Promise<string> {
  return loadText("../../ext/options.css")
}
