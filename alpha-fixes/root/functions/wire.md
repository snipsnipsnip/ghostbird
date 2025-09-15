[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / wire

# Function: wire()

> **wire**\<`TCatalog`\>(`classes`, `registry`): [`IWire`](../interfaces/IWire.md)\<`TCatalog`\>

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:241](https://github.com/snipsnipsnip/ghostbird/blob/0f088875c5b5424fe1397af81bc896ecf1b26e0e/src/root/util/wire.ts#L241)

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
