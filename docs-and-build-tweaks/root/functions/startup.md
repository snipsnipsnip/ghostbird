[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / startup

# Function: startup()

> **startup**\<`TCatalog`\>(`modules`, `registry`): [`Startup`](../type-aliases/Startup.md)\<`TCatalog`\>

Defined in: [work/ghostbird/ghostbird/src/root/startup.ts:38](https://github.com/snipsnipsnip/ghostbird/blob/921797a1a857727a2b90f345e08b28153de8c743/src/root/startup.ts#L38)

Collects available classes from given module objects to make a factory.

## Type Parameters

### TCatalog

`TCatalog`

## Parameters

### modules

`Iterable`\<`Record`\<`string`, `unknown`\>\>

### registry

[`IRegistry`](../type-aliases/IRegistry.md)\<`TCatalog`\>

## Returns

[`Startup`](../type-aliases/Startup.md)\<`TCatalog`\>
