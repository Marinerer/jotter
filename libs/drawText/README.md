# canvas-draw-text

[![version](https://img.shields.io/npm/v/canvas-draw-text?style=flat-square)][npm-url]
[![CI status][github-action-image]][github-action-url]
[![codecov](https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW)](https://codecov.io/gh/Marinerer/jotter)
[![downloads](https://img.shields.io/npm/dm/canvas-draw-text?style=flat-square)][npm-url]
[![size](https://img.shields.io/bundlephobia/minzip/canvas-draw-text?style=flat-square)](https://bundlephobia.com/package/canvas-draw-text)
[![license](https://img.shields.io/npm/l/canvas-draw-text?style=flat-square)][github-url]

[github-url]: https://github.com/Marinerer/jotter/blob/main/libs/drawText
[npm-url]: https://www.npmjs.com/package/canvas-draw-text
[github-action-image]: https://img.shields.io/github/actions/workflow/status/Marinerer/jotter/release.yml?style=flat-square
[github-action-url]: https://github.com/Marinerer/jotter/actions/workflows/release.yml

A utility designed to simplify Canvas text rendering that offers advanced features for text layout, styling, and management on HTML5 Canvas.

> 旨在简化 Canvas 文本渲染的实用工具函数，它为 HTML5 Canvas 上的文本布局、样式和管理提供高级功能。

## Features

- ✂️ Automatic Text Wrapping
- 📰 Text Alignment
- 📊 Rich Text Styling
- 🧮 Layout Control
- 🗳️ Overflow Handling
- 🌏 Detailed Return Data

## Installation

**npm**

```bash
npm install canvas-draw-text
```

**browser**

```
https://cdn.jsdelivr.net/npm/canvas-draw-text/dist/index.min.js
```

## Usage

```javascript
import drawText from 'canvas-draw-text'

// Get your canvas context
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

// Draw text with automatic wrapping
drawText(ctx, 'Your text here', 10, 10, 300, 200, {
	color: '#333',
	font: '16px Arial',
	textAlign: 'left',
	verticalAlign: 'top',
})
```

### Extension Method

You can also extend the CanvasRenderingContext2D prototype to use drawText as a method:

```javascript
import drawText from 'canvas-draw-text'

// Add the drawText method to the CanvasRenderingContext2D prototype
drawText.use()

// Now you can use it directly on the context
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

ctx.drawText('Your text here', 10, 10, 300, 200, {
	color: '#333',
	textAlign: 'center',
})
```

## API

### drawText(ctx, text, x, y, width, height, options)

```js
drawText(ctx, text, x, y, width, height, options)

// or

drawText(ctx, text, x, y, options)
```

Draws text on a canvas with advanced layout and styling options.

#### Parameters

| Parameter | Type                       | Default       | Description                       |
| --------- | -------------------------- | ------------- | --------------------------------- |
| `ctx`     | `CanvasRenderingContext2D` | _required_    | Canvas 2D context                 |
| `text`    | `string`                   | _required_    | Text to draw                      |
| `x`       | `number`                   | 0             | Left position of the drawing area |
| `y`       | `number`                   | 0             | Top position of the drawing area  |
| `width`   | `number`                   | canvas.width  | Width of the drawing area         |
| `height`  | `number`                   | canvas.height | Height of the drawing area        |
| `options` | `object`                   | `{}`          | Configuration options (see below) |

#### Options

| Option              | Type             | Default     | Description                                                                           |
| ------------------- | ---------------- | ----------- | ------------------------------------------------------------------------------------- |
| `padding`           | `number\|array`  | `0`         | Inner padding. Can be a single number or `[top, right, bottom, left]`                 |
| `textAlign`         | `string`         | `'left'`    | Horizontal alignment: `'left', 'center', 'right'`                                       |
| `verticalAlign`     | `string`         | `'top'`     | Vertical alignment: `'top', 'middle', 'bottom'`                                         |
| `font`              | `string\|object` | -           | Font settings. String format: `'16px Arial'` or object: `{size, family, weight, style}` |
| `color`             | `string`         | `'#000'`    | Text color                                                                            |
| `backgroundColor`   | `string`         | -           | Text background color                                                                 |
| `backgroundPadding` | `number\|array`  | `0`         | Padding around text for background.                                                   |
| `lineHeight`        | `number`         | `1.2`       | Line height multiplier                                                                |
| `letterSpacing`     | `number`         | `0`         | Spacing between characters                                                            |
| `wrap`              | `boolean`        | `true`      | Whether to automatically wrap text                                                    |
| `overflow`          | `string`         | `'visible'` | Overflow handling: `'visible', 'hidden'`                                                |
| `textOverflow`      | `string`         | `''`        | Text to display when content is truncated, e.g., `'...'   `                           |

#### Return Value

The function returns an object with the following properties:

| Property          | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| `totalLines`      | `number`  | Total number of lines (including overflow)         |
| `lines`           | `number`  | Number of visible lines                            |
| `maxTextHeight`   | `number`  | Height of all text lines (including overflow)      |
| `maxTextWidth`    | `number`  | Width of the widest text line (including overflow) |
| `textHeight`      | `number`  | Height of visible text                             |
| `textWidth`       | `number`  | Width of visible text                              |
| `availableWidth`  | `number`  | Available width for drawing (after padding)        |
| `availableHeight` | `number`  | Available height for drawing (after padding)       |
| `overflow`        | `boolean` | Whether text overflow occurred                     |

## Browser Support

Works in all modern browsers that support Canvas API. The library automatically handles browser compatibility issues for text measurements.

## License

MIT © [Mariner](https://github.com/Marinerer/)

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/jotter/pulls).
