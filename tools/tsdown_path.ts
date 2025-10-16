/** @file tsdown file path mapping helpers */

import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { PreRenderedChunk } from "rolldown"

/** Builds a file name for a given chunk */
export function chunkFileNames({ name }: PreRenderedChunk): string {
  if (name.includes(".")) {
    // Vendor library sources mostly as-is
    let path = findPrefix("/cache/", name)
    if (!path) {
      throw Error("Could not find /cache/ in the library source path. Are we using Yarn PnP?")
    }
    return `lib/${path.slice("/cache/".length)}`
  } else {
    return `js/${name}.bundle.js`
  }
}

/**
 * Adjusts source paths in sourcemap files to be relative to the project root.
 * Used in release builds.
 */
export function makeRelativeSourcePath(relativeSourcePath: string): string {
  // For release builds, we strip the path to make it easier to navigate in Thunderbird devtools
  let libPath = findPrefix("/node_modules/", relativeSourcePath)
  if (libPath) {
    return `.${libPath}`
  }
  let srcPath = findPrefix("/src/", relativeSourcePath)
  if (srcPath) {
    // Make it relative to the root
    return `..${srcPath}`
  }
  throw Error(`unexpected source path: ${relativeSourcePath}`)
}

/**
 * Resolves source paths in sourcemap files to absolute paths.
 * Used in development builds.
 */
export function makeAbsoluteSourcePath(relativeSourcePath: string, sourcemapPath: string): string {
  // For dev builds, we include the full path which makes the vscode debugger happy.
  // In this case we don't have to embed the original source code, but somehow tsdown seems to lack the option to
  // turn it off.
  let p = sourcemapPath
  for (let i = 0; ; i++) {
    if (100 < i) {
      throw Error(`Couldn't fix the sourcemap path [${relativeSourcePath}] -> [${sourcemapPath}]`)
    }
    p = dirname(p)

    let resolved = resolve(p, relativeSourcePath)
    if (existsSync(resolved)) {
      return resolved
    }
  }
}

/** Find the start of a prefix in `path` and returns the rest of the string if found */
export function findPrefix(prefix: string, path: string): string | undefined {
  let i = path.indexOf(prefix)
  return i === -1 ? undefined : path.slice(i)
}
