[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [ghosttext-runner](../README.md) / GhostTextRunner

# Class: GhostTextRunner

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/ghost\_text\_runner.d.ts:3

## Constructors

### Constructor

> **new GhostTextRunner**(`ghostTextConnector`, `ghostTextClient`, `heart`): `GhostTextRunner`

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/ghost\_text\_runner.d.ts:8

#### Parameters

##### ghostTextConnector

[`IGhostTextConnector`](../interfaces/IGhostTextConnector.md)

##### ghostTextClient

[`GhostTextClient`](../../ghosttext-session/classes/GhostTextClient.md)

##### heart

[`IHeart`](../interfaces/IHeart.md)

#### Returns

`GhostTextRunner`

## Properties

### isSingleton

> `static` **isSingleton**: `boolean`

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/ghost\_text\_runner.d.ts:7

## Methods

### run()

> **run**(`statusIndicator`, `editor`, `options`): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/ghost\_text\_runner.d.ts:9

#### Parameters

##### statusIndicator

[`IStatusIndicator`](../interfaces/IStatusIndicator.md)

##### editor

[`IClientEditor`](../interfaces/IClientEditor.md)

##### options

[`ClientOptions`](../type-aliases/ClientOptions.md)

#### Returns

`Promise`\<`void`\>

***

### runHandshakeCommand()

> **runHandshakeCommand**(`indicator`, `command`, `__namedParameters`): `Promise`\<\[[`CommandResult`](../../ghosttext-session/type-aliases/CommandResult.md)\] \| \[[`CommandResult`](../../ghosttext-session/type-aliases/CommandResult.md), [`ISession`](../interfaces/ISession.md)\]\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/ghost\_text\_runner.d.ts:10

#### Parameters

##### indicator

[`IStatusIndicator`](../interfaces/IStatusIndicator.md)

##### command

[`Command`](../../ghosttext-session/type-aliases/Command.md)

##### \_\_namedParameters

[`ClientOptions`](../type-aliases/ClientOptions.md)

#### Returns

`Promise`\<\[[`CommandResult`](../../ghosttext-session/type-aliases/CommandResult.md)\] \| \[[`CommandResult`](../../ghosttext-session/type-aliases/CommandResult.md), [`ISession`](../interfaces/ISession.md)\]\>

***

### runSessionCommand()

> **runSessionCommand**(`indicator`, `editor`, `session`, `command`): `Promise`\<[`CommandResult`](../../ghosttext-session/type-aliases/CommandResult.md)\>

Defined in: work/ghostbird/ghostbird/build/src/ghosttext-runner/ghost\_text\_runner.d.ts:11

#### Parameters

##### indicator

[`IStatusIndicator`](../interfaces/IStatusIndicator.md)

##### editor

[`IClientEditor`](../interfaces/IClientEditor.md)

##### session

[`ISession`](../interfaces/ISession.md)

##### command

[`Command`](../../ghosttext-session/type-aliases/Command.md)

#### Returns

`Promise`\<[`CommandResult`](../../ghosttext-session/type-aliases/CommandResult.md)\>
