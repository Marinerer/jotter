# DOM

```bash
import detectMouseDirection from 'kitify/detectMouseDirection'
```

## detectMouseDirection

检测获取鼠标移动到指定元素的移入和移出的方向。

```ts
function detectMouseDirection(
	element: HTMLElement,
	onEnter: Callback,
	onLeave: Callback
): () => void

// Callback = (direction: 'up' | 'down' | 'left' | 'right') => void
```
