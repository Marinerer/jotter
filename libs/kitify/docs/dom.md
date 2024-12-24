# DOM

DOM related utility functions

DOM元素相关工具函数。

## usage

```ts
import { detectMouseDirection } from 'kitify'

import detectMouseDirection from 'kitify/detectMouseDirection'
```

## API

### detectMouseDirection

Detect the direction of `mouseenter` and `mouseleave` when the mouse moves over element.

检测鼠标移动到指定元素时的移入和移出方向。

```ts
function detectMouseDirection(
	element: HTMLElement,
	onEnter: Callback,
	onLeave: Callback
): () => void

/*
Callback = (
	direction: 'up' | 'down' | 'left' | 'right',
	event: MouseEvent
) => void
*/
```

#### arguments
- `element` - The element to detect the mouse direction.
- `onEnter` - The callback function when the mouse enters the element.
- `onLeave` - The callback function when the mouse leaves the element.

#### returns
- `() => void` - The function to remove the event listeners.

