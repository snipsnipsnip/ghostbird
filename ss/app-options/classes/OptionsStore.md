[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [app-options](../README.md) / OptionsStore

# Class: OptionsStore

Defined in: work/ghostbird/ghostbird/build/src/app-options/options\_store.d.ts:4

A wrapper of OptionsSync responsible for loading and saving options from storage

## Implements

- [`IClientOptionsLoader`](../../ghosttext-runner/interfaces/IClientOptionsLoader.md)
- [`IOptionsStore`](../interfaces/IOptionsStore.md)

## Constructors

### Constructor

> **new OptionsStore**(): `OptionsStore`

#### Returns

`OptionsStore`

## Properties

### aliases

> `static` **aliases**: `string`

Defined in: work/ghostbird/ghostbird/build/src/app-options/options\_store.d.ts:6

***

### isSingleton

> `static` **isSingleton**: `boolean`

Defined in: work/ghostbird/ghostbird/build/src/app-options/options\_store.d.ts:5

## Methods

### exportToFile()

> **exportToFile**(): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-options/options\_store.d.ts:11

Opens the browser’s "save file" dialog to export options to a JSON file

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IOptionsStore`](../interfaces/IOptionsStore.md).[`exportToFile`](../interfaces/IOptionsStore.md#exporttofile)

***

### importFromFile()

> **importFromFile**(): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-options/options\_store.d.ts:10

Opens the browser’s file picker to import options from a previously-saved JSON file

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IOptionsStore`](../interfaces/IOptionsStore.md).[`importFromFile`](../interfaces/IOptionsStore.md#importfromfile)

***

### load()

> **load**(): `Promise`\<[`ClientOptions`](../../ghosttext-runner/type-aliases/ClientOptions.md)\>

Defined in: work/ghostbird/ghostbird/build/src/app-options/options\_store.d.ts:8

Loads the options from the Thunderbird's storage.

#### Returns

`Promise`\<[`ClientOptions`](../../ghosttext-runner/type-aliases/ClientOptions.md)\>

#### Implementation of

[`IClientOptionsLoader`](../../ghosttext-runner/interfaces/IClientOptionsLoader.md).[`load`](../../ghosttext-runner/interfaces/IClientOptionsLoader.md#load)

***

### syncForm()

> **syncForm**(`form`): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-options/options\_store.d.ts:9

Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved to storage

#### Parameters

##### form

`HTMLFormElement`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IOptionsStore`](../interfaces/IOptionsStore.md).[`syncForm`](../interfaces/IOptionsStore.md#syncform)
