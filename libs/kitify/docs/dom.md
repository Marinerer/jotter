# DOM

```bash
import detectMouseDirection from 'kitify/detectMouseDirection'
```

## detectMouseDirection

Detect the direction of mouseenter and mouseleave when the mouse moves over element.

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
