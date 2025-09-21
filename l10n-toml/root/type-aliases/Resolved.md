[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / Resolved

# Type Alias: Resolved\<TCatalog, TCtor\>

> **Resolved**\<`TCatalog`, `TCtor`\> = `TCtor` *extends* (...`args`) => infer T ? [`ResolvableArgs`](ResolvableArgs.md)\<`TCatalog`, `T`, `TArgs`\> : \[`"Failed to unpack arguments. Is it a constructor?"`, `never`, `TCtor`\]

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:79](https://github.com/snipsnipsnip/ghostbird/blob/79fde06dc6c0a36299c8b780ee8401edd339c22d/src/root/util/wire.ts#L79)

Resolves to the instance type of `TCtor` after some checks.

## Type Parameters

### TCatalog

`TCatalog`

### TCtor

`TCtor`
