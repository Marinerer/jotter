# Object

Object related utility functions

对象相关的工具函数。

## usage

```ts
import { assign, clone, cloneDeep } from 'kitify'

import assign from 'kitify/assign'
import clone from 'kitify/clone'
import cloneDeep from 'kitify/cloneDeep'
```

## API

### assign

Assigns enumerable properties of source objects to the target object.

将源对象的属性分配到目标对象上。

```ts
assign(target: object, ...sources: object[]): object
```

#### example

```js
assign({ a: 1 }, { b: 2 }, { b: 3 })
```

### clone

Creates a deep copy of the value.

创建一个深拷贝。

```ts
// Deep copy of the value.
clone<T>(value: T): T;

// Deep copy of the value. Supports Map,Set,ArrayBuffer...
cloneDeep<T>(value: T): T;

// Loop deep copy of the value.
cloneLoop<T>(value: T): T;

// JSON deep copy of the value.
cloneJSON<T>(value: T): T;
```
