# Object

Object related utility functions

对象相关的工具函数。

## usage

```ts
import { assign } from 'kitify'

import assign from 'kitify/assign'
```

## API

### assign

Assigns enumerable properties of source objects to the target object.

将源对象的属性分配到目标对象上。

```ts
assign(target: object, ...sources: object[]): object
```

#### arguments

| Name    | Type       | Description         |
| ------- | ---------- | ------------------- |
| target  | `object`   | The target object.  |
| sources | `object[]` | The source objects. |

#### example

```js
assign({ a: 1 }, { b: 2 }, { b: 3 })
```
