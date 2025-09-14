import { gitDescribe } from "git-describe"
import type { EmittedAsset, Plugin } from "rolldown"
import manifest from "../manifest_template.json" with { type: "json" }
import pkg from "../package.json" with { type: "json" }

type VersionInfo = { version: string }

export type Options = { env?: undefined | Record<string, string> }

/** Generates manifest.json from the template file */
export const generateManifest = ({ env }: Options = {}): Plugin => ({
  name: "generate_manifest",
  async generateBundle(): Promise<void> {
    // manifest.json can be reused for reproducibility
    let existing = await this.resolve("./ext/manifest.json")
    if (existing) {
      this.info(`manifest.json already exists; skipping generation`)
      return
    }

    this.info("Generating manifest.json")
    let { version } = await getVersionInfo(env).catch((e) => {
      this.warn(e)
      this.warn(
        "Generating dummy version; Build from a Git clone or place your ext/manifest.json to use the real one instead",
      )
      return { version: `unknown-${Date.now()}-try-placing-your-manifest-json-in-ext-directory-before-build` }
    })
    let manifest = makeManifestJson(version)

    this.emitFile({
      type: "asset",
      fileName: "manifest.json",
      originalFileName: "manifest_template.json",
      source: manifest,
    } satisfies EmittedAsset)
  },
})

function makeManifestJson(version: string): string {
  // biome-ignore-start lint/style/useNamingConvention: required by the spec https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/homepage_url
  let contents = {
    ...manifest,
    version,
    homepage_url: pkg.homepage,
  }
  // biome-ignore-end lint/style/useNamingConvention: required by the spec https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/homepage_url

  return JSON.stringify(contents, undefined, 2)
}

async function getVersionInfo(envInfo: undefined | Record<string, string>): Promise<VersionInfo> {
  let { GITHUB_REF_NAME: refName, GITHUB_SHA: sha, GITHUB_REF_TYPE: refType } = envInfo ?? {}

  // Use version info from env if available
  if (refName && sha && refType) {
    if (refType === "tag" && refName.startsWith("v")) {
      // this is a release build
      let version = refName.slice(1)
      return { version }
    } else {
      // this is a nightly build
      return { version: `nightly-${refName}-${sha}` }
    }
  }

  // Query git for local build
  let { semverString } = await gitDescribe({
    customArguments: ["--abbrev=16"],
  })
  if (!semverString) {
    throw Error("couldn't get the version from git")
  }
  let version = semverString

  return { version }
}
