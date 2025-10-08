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
import { AlarmHeart, prepareBackgroundRouter, startupCompose, startupOptions } from "src/root/startup"
import { describe, it } from "vitest"
import type OptionsSync from "webext-options-sync"

describe(prepareBackgroundRouter, () => {
  it("should resolve BackgroundEventRouter successfully", ({ expect }) => {
    let messenger = Symbol("messenger") as unknown as typeof globalThis.messenger
    let router = prepareBackgroundRouter({
      messenger,
      heart: new AlarmHeart(messenger),
      optionsSyncCtor: Symbol("optionsSyncCtor") as unknown as typeof OptionsSync,
    })
    expect(router).instanceOf(BackgroundEventRouter)
  })
})

describe(startupCompose, () => {
  it("should resolve ComposeEventRouter successfully", ({ expect }) => {
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
  it("should resolve OptionsEventRouter successfully", ({ expect }) => {
    let startup = startupOptions({
      optionsSyncCtor: Symbol("optionsSyncCtor") as unknown as typeof OptionsSync,
    })
    expect(startup(OptionsEventRouter)).instanceOf(OptionsEventRouter)
  })
})
