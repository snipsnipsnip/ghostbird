import { gitDescribe } from "git-describe"
import type { EmittedAsset, Plugin } from "rolldown"
import manifest from "../manifest_template.json" with { type: "json" }
import pkg from "../package.json" with { type: "json" }

type VersionInfo = { version: string; envInfo: Record<string, string> | undefined }

export type Options = { env?: undefined | Record<string, string> }

/** Generates manifest.json from the template file */
export const generateManifest = ({ env }: Options = {}): Plugin => ({
  name: "generate_manifest",
  async generateBundle(): Promise<void> {
    this.info("Generating manifest.json")
    let { version, envInfo } = await getVersionInfo(env ?? {}).catch((e) => {
      this.warn(e)
      return { version: "unknown", envInfo: undefined }
    })
    let manifest = makeManifestJson(version)

    this.emitFile({
      type: "asset",
      fileName: "manifest.json",
      originalFileName: "manifest_template.json",
      source: manifest,
    } satisfies EmittedAsset)

    if (envInfo) {
      this.emitFile({
        type: "asset",
        fileName: "env.yarn",
        source: listEnv(envInfo),
      } satisfies EmittedAsset)
    }
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

async function getVersionInfo(envInfo: Record<string, string>): Promise<VersionInfo> {
  let { GITHUB_REF_NAME: refName, GITHUB_SHA: sha, GITHUB_REF_TYPE: refType } = envInfo

  // Use version info from env if available
  if (refName && sha && refType) {
    if (refType === "tag" && refName.startsWith("v")) {
      // this is a release build
      return { version: refName.slice(1), envInfo }
    } else {
      // this is a nightly build
      return { version: `nightly-${refName}-${sha}`, envInfo }
    }
  }

  // Query git for local build
  let { semverString } = await gitDescribe({
    customArguments: ["--abbrev=16"],
  })
  if (!semverString) {
    throw Error("couldn't get the version from git")
  }
  return { version: semverString, envInfo: undefined }
}

function listEnv(envInfo: Record<string, string>): string {
  let keys = new Set([
    "CI",
    "GITHUB_REF_NAME",
    "GITHUB_SHA",
    "GITHUB_REF_TYPE",
    "GITHUB_SERVER_URL",
    "GITHUB_REPOSITORY",
    "GITHUB_RUN_ID",
  ])
  return Object.entries(envInfo)
    .filter((pair) => keys.has(pair[0]))
    .sort()
    .map((pair) => pair.join("="))
    .join("\n")
}
