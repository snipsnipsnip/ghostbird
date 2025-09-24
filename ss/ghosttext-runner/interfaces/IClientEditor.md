[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [ghosttext-runner](../README.md) / IClientEditor

# Interface: IClientEditor

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/api.d.ts:57

Client-side editor (the Thunderbird compose window) that is being synchronized with the external text editor

## Methods

### applyChange()

> **applyChange**(`change`): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/api.d.ts:65

Applies changes received from the GhostText server to the compose window

#### Parameters

##### change

[`ExternalEdit`](../../ghosttext-session/type-aliases/ExternalEdit.md)

The change from the server

#### Returns

`Promise`\<`void`\>

resolves when updated, or rejects if the editor has been closed

***

### getState()

> **getState**(): `Promise`\<[`EmailState`](../../ghosttext-session/type-aliases/EmailState.md)\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/api.d.ts:59

#### Returns

`Promise`\<[`EmailState`](../../ghosttext-session/type-aliases/EmailState.md)\>

complete current state of the editor

***

### popLastEdit()

> **popLastEdit**(): `undefined` \| [`InternalEdit`](../../ghosttext-session/type-aliases/InternalEdit.md)

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/api.d.ts:75

Get the most recent edit and drop the rest

#### Returns

`undefined` \| [`InternalEdit`](../../ghosttext-session/type-aliases/InternalEdit.md)

recent edit or `undefined` if no new edits have occurred

***

### waitEdit()

> **waitEdit**(): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/api.d.ts:70

Waits for an edit to occur in the local compose window.

#### Returns

`Promise`\<`void`\>

resolves when the user makes an edit, or rejects if the editor is closed
