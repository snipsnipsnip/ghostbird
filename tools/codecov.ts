import type { Plugin } from "rolldown"

export type CodecovOptions = {
  /** Name of the bundle */
  bundleName: string
  /** Environment variables which may contain the Codecov API token */
  env: Record<string, string | undefined>
}

/** Uploads bundle size information to Codecov if the API token is available in the environment */
export async function codecov({ bundleName, env: { CODECOV_TOKEN: uploadToken } }: CodecovOptions): Promise<Plugin[]> {
  if (!bundleName || !uploadToken) {
    return []
  }

  // lazy load the plugin to avoid loading it except when needed
  let { codecovRollupPlugin } = await import("@codecov/rollup-plugin")

  return codecovRollupPlugin({
    enableBundleAnalysis: true,
    bundleName,
    uploadToken,
  })
}
