[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / ResolvableArgs

# Type Alias: ResolvableArgs\<TCatalog, T, TArgs\>

> **ResolvableArgs**\<`TCatalog`, `T`, `TArgs`\> = `TArgs` *extends* \[infer TArg, `...(infer TRest)`\] ? `TArg` *extends* `TCatalog`\[keyof `TCatalog`\] ? `ResolvableArgs`\<`TCatalog`, `T`, `TRest`\> : \[`"An argument is not listed in TCatalog"`, `never`, `TArg`\] : `TArgs` *extends* \[\] ? `T` : \[`"Failed to unpack arguments. Is it a constructor?"`, `never`, `TArgs`\]

Defined in: [work/ghostbird/ghostbird/src/root/util/wire.ts:88](https://github.com/snipsnipsnip/ghostbird/blob/09d96a97f8d4edda7ed1db64c380383a700bbcd9/src/root/util/wire.ts#L88)

Resolves to `T` if all of the `TArgs` are listed in `TCatalog`. Resolves to an error otherwise.

## Type Parameters

### TCatalog

`TCatalog`

### T

`T`

### TArgs

`TArgs`
