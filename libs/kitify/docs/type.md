# Type

Provides some methods for interpreting data types.

一些判断数据类型的方法。

## Usage

```ts
import { isType, isObject, isFunction } from 'kitify'
// or
import { isType, isObject, isFunction } from 'kitify/type'

isObject({}) // true
isFunction(() => {})) // true
isType(123) // 'number'
isType('hello', 'string') // true
```

## API

### `isType(value: any, type?: string): string | boolean;`

Get/Determine the value type.

获取/判断 数据类型。

```js
import isType from 'kitify/isType'

isType(123) // 'number'
isType(new Date()) // 'date'
isType('hello', 'string') // true
```

### `isString: (value: any) => boolean`

### `isNumber: (value: any) => boolean`

### `isBoolean: (value: any) => boolean`

### `isArray: (value: any) => boolean`

### `isFunction: (value: any) => boolean`

### `isUndefined: (value: any) => boolean`

### `isNull: (value: any) => boolean`

### `isSymbol: (value: any) => boolean`

### `isBigInt: (value: any) => boolean`

### `isObject: (value: any) => boolean`

### `isNil: (value: any) => boolean`

### `isEmpty: (value: any) => boolean`

### `isInvalid: (value: any) => boolean`
