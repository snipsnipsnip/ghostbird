[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / Resolved

# Type Alias: Resolved\<TCatalog, TCtor\>

> **Resolved**\<`TCatalog`, `TCtor`\> = `TCtor` *extends* (...`args`) => infer T ? [`ResolvableArgs`](ResolvableArgs.md)\<`TCatalog`, `T`, `TArgs`\> : \[`"Failed to unpack arguments. Is it a constructor?"`, `never`, `TCtor`\]

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:72](https://github.com/snipsnipsnip/ghostbird/blob/0a5d2e9a0b4d17e1fff1110e721fe8e702187e55/src/root/util/wire.ts#L72)

Resolves to the instance type of `TCtor` after some checks.

## Type Parameters

### TCatalog

`TCatalog`

### TCtor

`TCtor`
