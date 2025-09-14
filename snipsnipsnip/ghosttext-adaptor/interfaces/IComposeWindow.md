[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [ghosttext-adaptor](../README.md) / IComposeWindow

# Interface: IComposeWindow

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-adaptor/api.d.ts:32

an utility to interact with a mail compose window

## Properties

### tabId

> `readonly` **tabId**: `number`

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-adaptor/api.d.ts:34

Practically ID of the compose window

## Methods

### getDetails()

> **getDetails**(): `PromiseLike`\<[`ComposeDetails`](../type-aliases/ComposeDetails.md)\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-adaptor/api.d.ts:41

#### Returns

`PromiseLike`\<[`ComposeDetails`](../type-aliases/ComposeDetails.md)\>

Values of input fields

***

### openPort()

> **openPort**(): [`IGhostServerPort`](../type-aliases/IGhostServerPort.md)

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-adaptor/api.d.ts:51

#### Returns

[`IGhostServerPort`](../type-aliases/IGhostServerPort.md)

a connected port from the background script to the content script

***

### prepareContentScript()

> **prepareContentScript**(): `PromiseLike`\<`boolean`\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-adaptor/api.d.ts:39

Injects `compose.js` if it hasn't been injected yet

#### Returns

`PromiseLike`\<`boolean`\>

resolves to `true` if the script was injected, or `false` if it was already present

***

### setDetails()

> **setDetails**(`details`): `PromiseLike`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-adaptor/api.d.ts:47

Updates the input fields

#### Parameters

##### details

[`SettableComposeDetails`](../type-aliases/SettableComposeDetails.md)

The new details to set

#### Returns

`PromiseLike`\<`void`\>

resolves after the update

***

### setIcon()

> **setIcon**(`imageFilePath`): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-adaptor/api.d.ts:57

Updates the toolbar icon

#### Parameters

##### imageFilePath

`string`

The path to the icon file relative to `manifest.json`

#### Returns

`Promise`\<`void`\>

resolves when the icon has been set
