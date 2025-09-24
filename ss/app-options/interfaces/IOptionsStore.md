[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [app-options](../README.md) / IOptionsStore

# Interface: IOptionsStore

Defined in: work/ghostbird/ghostbird/build/src/app-options/api.d.ts:2

A wrapper of `storage` API that holds all options

## Methods

### exportToFile()

> **exportToFile**(): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-options/api.d.ts:11

Opens the browser’s "save file" dialog to export options to a JSON file

#### Returns

`Promise`\<`void`\>

***

### importFromFile()

> **importFromFile**(): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-options/api.d.ts:9

Opens the browser’s file picker to import options from a previously-saved JSON file

#### Returns

`Promise`\<`void`\>

***

### syncForm()

> **syncForm**(`formSelector`): `Promise`\<`void`\>

Defined in: work/ghostbird/ghostbird/build/src/app-options/api.d.ts:7

Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved to storage

#### Parameters

##### formSelector

`HTMLFormElement`

#### Returns

`Promise`\<`void`\>
