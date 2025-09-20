/**
 * @file Checks the shape of `manifest.json`
 * This file is not actually loaded by vitest, as the typecheck
 * doesn't seem to work for me in the current version.
 * It's fine since `yarn check`, `yarn build` or `yarn build-js` will check this file.
 */

import type { CommandId } from "src/app-background/api"
import { expectTypeOf, test } from "vitest"
import type manifest from "../../manifest_template.json"

test("The CommandId type must be the same as listed in the manifest.json", () => {
  expectTypeOf<keyof typeof manifest.commands>().toEqualTypeOf<CommandId>()
})
