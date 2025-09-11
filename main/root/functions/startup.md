[**@exteditor/ghostbird**](../../README.md)

***

[@exteditor/ghostbird](../../modules.md) / [root](../README.md) / startup

# Function: startup()

> **startup**\<`TCatalog`\>(`modules`, `registry`): \<`TCtor`\>(`ctor`, `deps?`) => [`Resolved`](../type-aliases/Resolved.md)\<`TCatalog`, `TCtor`\>

Defined in: [work/ghostbird/ghostbird/src/root/startup.ts:33](https://github.com/snipsnipsnip/ghostbird/blob/dcc2434b9159d309d6eb8e7e91115f4ea0d210bc/src/root/startup.ts#L33)

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

> \<`TCtor`\>(`ctor`, `deps?`): [`Resolved`](../type-aliases/Resolved.md)\<`TCatalog`, `TCtor`\>

### Type Parameters

#### TCtor

`TCtor`

### Parameters

#### ctor

`TCtor`

#### deps?

`Iterable`\<`string` & keyof `TCatalog`, `any`, `any`\>

### Returns

[`Resolved`](../type-aliases/Resolved.md)\<`TCatalog`, `TCtor`\>
