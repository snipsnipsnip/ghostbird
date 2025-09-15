[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / ResolveQuery

# Type Alias: ResolveQuery\<TCatalog, T\>

> **ResolveQuery**\<`TCatalog`, `T`\> = \[`"createOne"`, `Readonly`\<[`IClassInfo`](../interfaces/IClassInfo.md)\<`TCatalog`, `T`\>\>\] \| \[`"resolveOne"`, keyof `TCatalog` & `string`\] \| \[`"resolveAll"`, `Iterable`\<keyof `TCatalog` & `string`\>\] \| \[`"const"`, `T`\]

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:112](https://github.com/snipsnipsnip/ghostbird/blob/b99fe991c2421e326430d052fb6e5577b4eb8215/src/root/util/wire.ts#L112)

An entry in the registry. It contains a query to the `IResolver` paired with a key.

## Type Parameters

### TCatalog

`TCatalog`

### T

`T`
