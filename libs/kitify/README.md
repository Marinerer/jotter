# kitify

[![version][npm-image]][npm-url]
[![CI status][github-action-image]][github-action-url]
[![codecov][codecov-image]][codecov-url]
[![downloads][downloads-image]][npm-url]
[![size][bundlephobia-image]](https://bundlephobia.com/package/kitify)
[![browsers](https://img.shields.io/badge/Browser-IE9-brightgreen?style=flat-square)][github-url]

[github-url]: https://github.com/Marinerer/jotter/blob/main/libs/kitify
[npm-url]: https://www.npmjs.com/package/kitify
[npm-image]: https://img.shields.io/npm/v/kitify?style=flat-square
[github-action-image]: https://img.shields.io/github/actions/workflow/status/Marinerer/jotter/release.yml?style=flat-square
[github-action-url]: https://github.com/Marinerer/jotter/actions/workflows/release.yml
[codecov-image]: https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW
[codecov-url]: https://codecov.io/gh/Marinerer/jotter
[downloads-image]: https://img.shields.io/npm/dm/kitify?style=flat-square
[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/kitify?style=flat-square

`kitify` (`kit + ify`) is a JavaScript utility library that provides a whole mess of useful helper functions and supports modularity.

`kitify` 是一个 JavaScript 工具函数包，它提供了一大堆有用的辅助工具函数, 并支持模块化。

## Installation

```bash
npm install kitify
```

## Usage

```js
import { isType, isObject } from 'kitify'

isObject({}) // true
isType(123) // 'number'
isType('hello', 'string') // true
```

## API

### [Type](./docs/type.md)

Provides some methods for interpreting data types.

一些判断数据类型的方法。

| Method        | Description                                  |
| ------------- | -------------------------------------------- |
| `isType`      | Check if the value is of the specified type. |
| `isObject`    | Check if the value is an object.             |
| `isFunction`  | Check if the value is a function.            |
| `isString`    | Check if the value is a string.              |
| `isNumber`    | Check if the value is a number.              |
| `isBoolean`   | Check if the value is a boolean.             |
| `isArray`     | Check if the value is an array.              |
| `isSymbol`    | Check if the value is a symbol.              |
| `isUndefined` | Check if the value is undefined.             |
| `isNull`      | Check if the value is null.                  |
| `isBigInt`    | Check if the value is a BigInt.              |
| `isNil`       | Check if the value is null or undefined.     |
| `isEmpty`     | Check if the value is empty.                 |
| `isInvalid`   | Check if the value is invalid.               |

### [Object](./docs/object.md)

Object related utility functions

对象相关的工具函数。

| Method      | Description                                             |
| ----------- | ------------------------------------------------------- |
| `assign`    | Merge objects into a new object.                        |
| `clone`     | Deep copy of the value.                                 |
| `cloneDeep` | Deep copy of the value. Supports Map,Set,ArrayBuffer... |
| `cloneLoop` | Loop deep copy of the value.                            |
| `cloneJSON` | JSON deep copy of the value.                                   |

### Function

### String

### [DOM](./docs/dom.md)

DOM related utility functions

DOM元素相关工具函数。

| Method                 | Description                          |
| ---------------------- | ------------------------------------ |
| `detectMouseDirection` | Detect the mouse movement direction. |

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/jotter/pulls).
