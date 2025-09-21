[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / ResolveQuery

# Type Alias: ResolveQuery\<TCatalog, T\>

> **ResolveQuery**\<`TCatalog`, `T`\> = \[`"prepareOne"`, `Readonly`\<[`IClassInfo`](../interfaces/IClassInfo.md)\<`TCatalog`, `T`\>\>\] \| \[`"resolveOne"`, keyof `TCatalog` & `string`\] \| \[`"resolveAll"`, `Iterable`\<keyof `TCatalog` & `string`\>\] \| \[`"const"`, `T`\]

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:122](https://github.com/snipsnipsnip/ghostbird/blob/79fde06dc6c0a36299c8b780ee8401edd339c22d/src/root/util/wire.ts#L122)

An entry in the registry. It contains a query to the `IResolver` paired with a key.

## Type Parameters

### TCatalog

`TCatalog`

### T

`T`
