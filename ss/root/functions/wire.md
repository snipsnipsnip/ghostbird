[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / wire

# Function: wire()

> **wire**\<`TCatalog`\>(`classes`, `registry`): [`IWire`](../interfaces/IWire.md)\<`TCatalog`\>

Defined in: [work/ghostbird/ghostbird/src/root/util/alias\_map.ts:68](https://github.com/snipsnipsnip/ghostbird/blob/09d96a97f8d4edda7ed1db64c380383a700bbcd9/src/root/util/alias_map.ts#L68)

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

A DI container
