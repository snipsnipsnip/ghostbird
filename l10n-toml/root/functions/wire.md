[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / wire

# Function: wire()

> **wire**\<`TCatalog`\>(`classes`, `registry`): [`IWire`](../interfaces/IWire.md)\<`TCatalog`\>

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:260](https://github.com/snipsnipsnip/ghostbird/blob/79fde06dc6c0a36299c8b780ee8401edd339c22d/src/root/util/wire.ts#L260)

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
