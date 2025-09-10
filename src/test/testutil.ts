import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { env } from "node:process"

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
