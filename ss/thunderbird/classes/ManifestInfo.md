[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [thunderbird](../README.md) / ManifestInfo

# Class: ManifestInfo

Defined in: work/ghostbird/ghostbird/build/src/thunderbird/background\_util/manifest\_info.d.ts:3

Queries current shortcut key config

## Implements

- [`ICommandConfig`](../../app-background/interfaces/ICommandConfig.md)
- [`IManifestInfo`](../../ghosttext-adaptor/interfaces/IManifestInfo.md)

## Constructors

### Constructor

> **new ManifestInfo**(`messenger`): `ManifestInfo`

Defined in: work/ghostbird/ghostbird/build/src/thunderbird/background\_util/manifest\_info.d.ts:7

#### Parameters

##### messenger

*typeof* `messenger`

#### Returns

`ManifestInfo`

## Properties

### messenger

> `readonly` **messenger**: *typeof* `messenger`

Defined in: work/ghostbird/ghostbird/build/src/thunderbird/background\_util/manifest\_info.d.ts:4

***

### aliases

> `static` **aliases**: `string`[]

Defined in: work/ghostbird/ghostbird/build/src/thunderbird/background\_util/manifest\_info.d.ts:6

***

### isSingleton

> `static` **isSingleton**: `boolean`

Defined in: work/ghostbird/ghostbird/build/src/thunderbird/background\_util/manifest\_info.d.ts:5

## Methods

### getAll()

> **getAll**(): `Promise`\<[`CommandInfo`](../../app-background/type-aliases/CommandInfo.md)[]\>

Defined in: work/ghostbird/ghostbird/build/src/thunderbird/background\_util/manifest\_info.d.ts:8

#### Returns

`Promise`\<[`CommandInfo`](../../app-background/type-aliases/CommandInfo.md)[]\>

all commands defined in manifest.json

#### Implementation of

[`ICommandConfig`](../../app-background/interfaces/ICommandConfig.md).[`getAll`](../../app-background/interfaces/ICommandConfig.md#getall)

***

### getId()

> **getId**(): `string`

Defined in: work/ghostbird/ghostbird/build/src/thunderbird/background\_util/manifest\_info.d.ts:9

#### Returns

`string`

#### Implementation of

[`IManifestInfo`](../../ghosttext-adaptor/interfaces/IManifestInfo.md).[`getId`](../../ghosttext-adaptor/interfaces/IManifestInfo.md#getid)
