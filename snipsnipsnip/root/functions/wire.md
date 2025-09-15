[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / wire

# Function: wire()

> **wire**\<`TCatalog`\>(`classes`, `registry`): [`IWire`](../interfaces/IWire.md)\<`TCatalog`\>

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:241](https://github.com/snipsnipsnip/ghostbird/blob/b99fe991c2421e326430d052fb6e5577b4eb8215/src/root/util/wire.ts#L241)

Creates a factory from the collected class constructors and their parameters

## Type Parameters

### TCatalog

`TCatalog`

## Parameters

### classes

`Iterable`\<`Readonly`\<[`IClassInfo`](../interfaces/IClassInfo.md)\<`TCatalog`, `unknown`, `unknown`[]\>\>\>

Class constructors with some metadata to instruct its construction

### registry

[`IRegistry`](../type-aliases/IRegistry.md)\<`TCatalog`\>

A map used for caching registrations

## Returns

[`IWire`](../interfaces/IWire.md)\<`TCatalog`\>

A wrapped registry that does dependency injection
