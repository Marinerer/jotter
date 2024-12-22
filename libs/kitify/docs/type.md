# type

Provides some methods for interpreting data types.

提供一些判读数据类型的方法。

```ts
import { isType, isObject, isFunction } from 'kitify'
// or
import { isType, isObject, isFunction } from 'kitify/type'

isObject({}) // true
isFunction(() => {})) // true
isType(123) // number
isType('hello', 'string') // true
```

## isType

```ts
function isType(value: any, type?: string): string | boolean
```

**examples:**

```ts
isType(123) // number
isType(new Date()) // date
isType('hello', 'string') // true
isType('hello', 'number') // false
```
