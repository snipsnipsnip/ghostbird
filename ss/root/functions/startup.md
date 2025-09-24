[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / startup

# Function: startup()

> **startup**\<`TCatalog`\>(`modules`, `registry`): [`Startup`](../type-aliases/Startup.md)\<`TCatalog`\>

Defined in: [work/ghostbird/ghostbird/src/root/startup.ts:38](https://github.com/snipsnipsnip/ghostbird/blob/09d96a97f8d4edda7ed1db64c380383a700bbcd9/src/root/startup.ts#L38)

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
