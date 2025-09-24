[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / makeAliasMap

# Function: makeAliasMap()

> **makeAliasMap**\<`TCatalog`\>(`nameForDuplicatesOf`): [`IAliasMap`](../interfaces/IAliasMap.md)\<`TCatalog`\>

Defined in: [work/ghostbird/ghostbird/src/root/util/alias\_map.ts:53](https://github.com/snipsnipsnip/ghostbird/blob/09d96a97f8d4edda7ed1db64c380383a700bbcd9/src/root/util/alias_map.ts#L53)

Creates a map that collects (possibly duplicated) aliases and populate them as dependencies

## Type Parameters

### TCatalog

`TCatalog`

## Parameters

### nameForDuplicatesOf

(`alias`) => `string`

A function to generate names for duplicate aliases

## Returns

[`IAliasMap`](../interfaces/IAliasMap.md)\<`TCatalog`\>

AliasMap that can be passed as an argument to `wireWith`
