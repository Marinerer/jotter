# canvas-scrollbar

[![version](https://img.shields.io/npm/v/canvas-scrollbar?style=flat-square)][npm-url]
[![CI status][github-action-image]][github-action-url]
[![codecov](https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW)](https://codecov.io/gh/Marinerer/jotter)
[![downloads](https://img.shields.io/npm/dm/canvas-scrollbar?style=flat-square)][npm-url]
[![size](https://img.shields.io/bundlephobia/minzip/canvas-scrollbar?style=flat-square)](https://bundlephobia.com/package/canvas-scrollbar)
[![license](https://img.shields.io/npm/l/canvas-scrollbar?style=flat-square)][github-url]

[github-url]: https://github.com/Marinerer/jotter/blob/main/libs/scrollbar
[npm-url]: https://www.npmjs.com/package/canvas-scrollbar
[github-action-image]: https://img.shields.io/github/actions/workflow/status/Marinerer/jotter/release.yml?style=flat-square
[github-action-url]: https://github.com/Marinerer/jotter/actions/workflows/release.yml

A lightweight, customizable scrollbar implementation for HTML Canvas elements. This library provides an efficient way to add scrolling capabilities to canvas-based applications.

> 应用于 `Canvas` 的自定义滚动条组件，支持水平和垂直方向滚动，可自定义样式和交互行为。

## Features

- 🚥 Scrolling horizontally and vertically
- 💄 Customizable appearance
- ⏰ Support mouse and wheel events
- 🚀 No dependencies

## Installation

**npm**

```bash
npm install canvas-scrollbar
```

**browser**

```
https://cdn.jsdelivr.net/npm/canvas-scrollbar/dist/index.min.js
```

## Usage

```javascript
const canvas = document.getElementById('myCanvas')
const scrollbar = new CanvasScrollbar(canvas, {
	direction: 'y', // 'y' for vertical, 'x' for horizontal
	contentSize: 1000, // Total content height/width
	viewportSize: canvas.height, // Visible area size
	onscroll: (position, maxScroll) => {
		// Handle scroll position changes
		console.log('Scrolled to:', position)
	},
})
```

> [!TIP]
>
> Vertical scrollbar defaults to right side.  
> Horizontal scrollbar defaults to bottom side.

## API

### Constructor

```javascript
new CanvasScrollbar(canvas, options)
```

#### Parameters

- `canvas` (HTMLCanvasElement): The canvas element to attach the scrollbar to
- `options` (Object): Configuration options

#### Options

| Option         | Type     | Default            | Description                                                    |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- |
| `x`            | number   | -                  | Scrollbar's left position                                      |
| `y`            | number   | -                  | Scrollbar's top position                                       |
| `width`        | number   | -                  | Scrollbar's width                                              |
| `height`       | number   | -                  | Scrollbar's height                                             |
| `direction`    | string   | `'y'`              | Scroll direction: 'x' or 'y'                                   |
| `contentSize`  | number   | 0                  | Total content size (width for horizontal, height for vertical) |
| `viewportSize` | number   | Canvas dimension   | Visible area size                                              |
| `style`        | object   | See below          | Scrollbar styling options                                      |
| `onscroll`     | function | `(pos, max) => {}` | Callback when scroll position changes                          |

#### Style Options

| Option            | Type   | Default | Description                        |
| ----------------- | ------ | ------- | ---------------------------------- |
| `color`           | string | '#000'  | Scrollbar thumb color              |
| `backgroundColor` | string | '#fff'  | Scrollbar track color              |
| `radius`          | number | 0       | Scrollbar corner radius            |
| `padding`         | number | 0       | Padding inside the scrollbar track |

### Methods

#### `draw()`

Draws the scrollbar on the canvas.

```javascript
scrollbar.draw()
```

#### `scroll(delta)`

Scrolls by the specified amount.

```javascript
// Scroll down 50 pixels
scrollbar.scroll(50)
```

#### `scrollTo(position)`

Scrolls to a specific position.

```javascript
// Scroll to position 200
scrollbar.scrollTo(200)
```

#### `update(contentSize, viewportSize)`

Updates the content and viewport dimensions.

```javascript
// Update when content changes
scrollbar.update(newContentSize, newViewportSize)
```

#### `destroy()`

Removes event listeners and cleans up resources.

```javascript
scrollbar.destroy()
```

## Examples

```javascript
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

// Content to be scrolled
const content = {
	height: 2000,
	render: function (pos) {
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		ctx.save()
		ctx.translate(0, -pos)

		ctx.fillStyle = '#007bff'
		for (let y = 0; y < content.height; y += 100) {
			for (let x = 0; x < canvas.width; x += 100) {
				ctx.fillRect(x + 10, y + 10, 80, 80)
			}
		}

		ctx.restore()
	},
}

// Create scrollbar
const scrollbar = new CanvasScrollbar(canvas, {
	direction: 'y',
	contentSize: content.height,
	style: {
		color: '#555',
		backgroundColor: '#eee',
		radius: 5,
		padding: 2,
	},
	onscroll: (position) => {
		// Redraw content at new scroll position
		content.render(position)
	},
})

// Initial render
content.render(0)
scrollbar.draw()
```

## License

MIT © [Mariner](https://github.com/Marinerer/)

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/jotter/pulls).
