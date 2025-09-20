[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / Resolved

# Type Alias: Resolved\<TCatalog, TCtor\>

> **Resolved**\<`TCatalog`, `TCtor`\> = `TCtor` *extends* (...`args`) => infer T ? [`ResolvableArgs`](ResolvableArgs.md)\<`TCatalog`, `T`, `TArgs`\> : \[`"Failed to unpack arguments. Is it a constructor?"`, `never`, `TCtor`\]

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:72](https://github.com/snipsnipsnip/ghostbird/blob/8061cafc81c997f7ee346743cecfdb43cf507bbf/src/root/util/wire.ts#L72)

Resolves to the instance type of `TCtor` after some checks.

## Type Parameters

### TCatalog

`TCatalog`

### TCtor

`TCtor`
