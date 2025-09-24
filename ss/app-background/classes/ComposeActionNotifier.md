[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [app-background](../README.md) / ComposeActionNotifier

# Class: ComposeActionNotifier

Defined in: work/ghostbird/ghostbird/build/src/app-background/compose\_action\_notifier.d.ts:3

## Constructors

### Constructor

> **new ComposeActionNotifier**(`ghostTextRunner`, `clientOptionsLoader`, `manifestInfo`): `ComposeActionNotifier`

Defined in: work/ghostbird/ghostbird/build/src/app-background/compose\_action\_notifier.d.ts:9

#### Parameters

##### ghostTextRunner

[`GhostTextRunner`](../../ghosttext-runner/classes/GhostTextRunner.md)

##### clientOptionsLoader

[`IClientOptionsLoader`](../../ghosttext-runner/interfaces/IClientOptionsLoader.md)

##### manifestInfo

[`IManifestInfo`](../../ghosttext-adaptor/interfaces/IManifestInfo.md)

#### Returns

`ComposeActionNotifier`

## Properties

### isSingleton

> `static` **isSingleton**: `boolean`

Defined in: work/ghostbird/ghostbird/build/src/app-background/compose\_action\_notifier.d.ts:7

## Methods

### start()

> **start**(`tab`): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-background/compose\_action\_notifier.d.ts:10

#### Parameters

##### tab

[`IComposeWindow`](../../ghosttext-adaptor/interfaces/IComposeWindow.md)

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(`tab`): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-background/compose\_action\_notifier.d.ts:11

#### Parameters

##### tab

[`IComposeWindow`](../../ghosttext-adaptor/interfaces/IComposeWindow.md)

#### Returns

`Promise`\<`void`\>

***

### toggle()

> **toggle**(`tab`): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-background/compose\_action\_notifier.d.ts:12

#### Parameters

##### tab

[`IComposeWindow`](../../ghosttext-adaptor/interfaces/IComposeWindow.md)

#### Returns

`Promise`\<`void`\>
