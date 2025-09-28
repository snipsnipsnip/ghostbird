/**
 * @file
 * Tests here run every time we build as a sanity check.
 * These tests are not meant to be comprehensive, but are enough to catch common
 * mistakes that aren't detected by the TypeScript compiler, such as typos in
 * dependency names, or missing exports.
 */

import { BackgroundEventRouter } from "src/app-background/background_event_router"
import { ComposeEventRouter } from "src/app-compose/compose_event_router"
import { OptionsEventRouter } from "src/app-options/options_event_router"
import { startupBackground, startupCompose, startupOptions } from "src/root/startup"
import type { AlarmHeart } from "src/thunderbird"
import { describe, expect, it } from "vitest"

describe(startupBackground, () => {
  it("should resolve BackgroundEventRouter successfully", () => {
    let startup = startupBackground({
      messenger: Symbol("messenger") as unknown as typeof messenger,
      heart: Symbol("heart") as unknown as AlarmHeart,
    })
    expect(startup(BackgroundEventRouter)).instanceOf(BackgroundEventRouter)
  })
})

describe(startupCompose, () => {
  it("should resolve ComposeEventRouter successfully", () => {
    let startup = startupCompose({
      messenger: Symbol("messenger") as unknown as typeof messenger,
      body: Symbol("body"),
      domParser: Symbol("domParser"),
      selection: Symbol("selection"),
    })
    expect(startup(ComposeEventRouter)).instanceOf(ComposeEventRouter)
  })
})

describe(startupOptions, () => {
  it("should resolve OptionsEventRouter successfully", () => {
    let startup = startupOptions({})
    expect(startup(OptionsEventRouter)).instanceOf(OptionsEventRouter)
  })
})
