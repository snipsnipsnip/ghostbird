[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / doc/building

# Building Ghostbird

[`tools/tsdown_config.ts`](../../_media/tsdown_config.ts) serves as the build script of Ghostbird. It makes heavy use of custom plugins which would make comments lengthy, and I felt they might be worth a separate document.

## Overview

- Running `yarn build-js` invokes tsdown, which performs several tasks:
    - Generating `index.ts` (barrel exports).
    - Type checking.
    - Generating `manifest.json` from the template file.
    - Generating localized `messages.json` files.
    - Adjusting source maps.
    - Copying static assets from `ext/` into `dist/ext/`.
    - Compiling bundled JavaScript files into `dist/ext/`.
- Running `yarn build-xpi` zips it up to produce `dist/ghostbird-{version}.xpi`. [`web-ext`](https://github.com/mozilla/web-ext#web-ext) does the actual work.
- The usual `yarn build` runs both of the above after running the linter and tests.

## Build modes

- It's a release build if:
    - the `CI` environment variable is set, or
    - `ext/manifest.json` exists.
- Otherwise, it's a development build.
- Currently, there is no difference between development and release builds except the content of source map files.

## Source maps

- In release mode, source maps have relative paths to source files.
- In development mode, source maps have absolute paths to source files to make debuggers happy.

## Rollup plugins

The build script uses several custom plugins, each serving a different purpose:

1. [`tools/barrelsby.ts`](../../_media/barrelsby.ts) generates `index.ts` barrel files.
1. [`tools/typecheck_with_tsc.ts`](../../_media/typecheck_with_tsc.ts) runs `tsc --build`.
   - tsdown doesn't check types, so we run it separately.
1. [`tools/generate_locale_messages.ts`](../../_media/generate_locale_messages.ts) generates [message files](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization) from the definition in [`locales.toml`](../../_media/locales.toml).
1. [`tools/generate_manifest.ts`](../../_media/generate_manifest.ts) prepares `manifest.json` by filling in placeholders in [`manifest_template.json`](../../_media/manifest_template.json).

## Version number calculation

The build script has four assumed use cases, each uses a different source of version information:

1. A CI system builds the extension for distribution.
   - In this case, environment variables contains version information, so it produces a release build with a version number derived from the pushed Git tag.
2. A release maintainer (or a security-conscious user) trying to reproduce a release build.
   - In this case, `ext/manifest.json` is present, so it produces a release build using it.
3. A developer builds the extension for debugging.
   - In this case, `git describe` works, so it produces a development build with a version number derived from Git information.
4. A user builds the extension for their own use from a tarball.
   - In this case, the source code lacks Git version information, so it produces  a development build with a dummy version number that includes a timestamp.

## Build reproducibility

* Building with `ext/manifest.json` should produce identical result to one from CI in terms of file names and their contents.
* However, they will have different timestamps and file order, meaning Ghostbird builds are not reproducible in the strict sense.
* It would be possible to wipe mtimes to make zips compare identical, but this was deemed pointless as AMO repackages the zip when signing the add-on anyway.
* See [the issue page of the `web-ext` tool](https://github.com/mozilla/web-ext/issues/2381#issuecomment-1075667618) for details.
