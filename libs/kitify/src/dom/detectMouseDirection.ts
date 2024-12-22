type Direction = 'top' | 'right' | 'bottom' | 'left'
type Callback = (this: HTMLElement, direction: Direction, e: MouseEvent) => void
type MousePosition = { x: number; y: number }

/**
 * 监听鼠标在元素上移入和移出的方向
 * @param {HTMLElement} element 监听元素
 * @param {Callback} onEnter 鼠标进入回调
 * @param {Callback} onLeave 鼠标离开回调
 *
 * 这个函数提供了以下功能：
 * 可以检测鼠标从元素的四个边缘（上、右、下、左）进入和离开的情况
 * 支持自定义回调函数处理进入和离开事件
 * 返回清理函数以便移除事件监听器
 */
export default function detectMouseDirection(
	element: HTMLElement,
	onEnter: Callback,
	onLeave: Callback
) {
	let lastPosition: MousePosition | null = null

	function calculateAngle(x1: number, y1: number, x2: number, y2: number, action = 'enter') {
		// 计算鼠标移动的角度（弧度）
		const dx = x2 - x1
		const dy = y2 - y1
		if (action === 'enter') {
			// 添加 PI 来反转角度，使其对应进入方向而不是移动方向
			return (Math.atan2(dy, dx) + Math.PI) % (2 * Math.PI)
		}
		return Math.atan2(dy, dx)
	}

	function getMoveEdge(angle: number): Direction {
		// 将弧度转换为角度
		const degrees = ((angle * 180) / Math.PI + 360) % 360 // 将角度限制在0-360之间

		// 根据角度判断进入方向
		// 315-45 为右边进入
		// 45-135 为下边进入
		// 135-225 为左边进入
		// 225-315 为上边进入
		if (degrees >= 315 || degrees < 45) return 'right'
		if (degrees >= 45 && degrees < 135) return 'bottom'
		if (degrees >= 135 && degrees < 225) return 'left'
		return 'top'
	}

	// 监听鼠标移动事件，记录最后的鼠标位置
	function handleMouseMove(event: MouseEvent) {
		lastPosition = { x: event.clientX, y: event.clientY }
	}

	// 监听鼠标进入事件
	function handleMouseEnter(this: HTMLElement, event: MouseEvent) {
		if (!lastPosition) return
		// 获取鼠标当前位置
		const currentPosition = { x: event.clientX, y: event.clientY }
		// 计算鼠标移动的角度
		const angle = calculateAngle(
			lastPosition.x,
			lastPosition.y,
			currentPosition.x,
			currentPosition.y,
			'enter'
		)
		// 获取进入的边缘
		const direction = getMoveEdge(angle)
		typeof onEnter === 'function' && onEnter.call(this, direction, event)

		// 重置最后鼠标位置
		lastPosition = currentPosition
	}

	// 监听鼠标离开事件，重置最后鼠标位置
	function handleMouseLeave(this: HTMLElement, event: MouseEvent) {
		if (!lastPosition) return
		const currentPosition = { x: event.clientX, y: event.clientY }
		// 计算鼠标移动的角度
		const angle = calculateAngle(
			lastPosition.x,
			lastPosition.y,
			currentPosition.x,
			currentPosition.y,
			'leave'
		)
		// 获取进入的边缘
		const direction = getMoveEdge(angle)
		typeof onLeave === 'function' && onLeave.call(this, direction, event)
		// 重置最后鼠标位置
		lastPosition = null
	}

	// 添加事件监听器
	document.addEventListener('mousemove', handleMouseMove)
	element.addEventListener('mouseenter', handleMouseEnter)
	element.addEventListener('mouseleave', handleMouseLeave)

	return function () {
		// 移除事件监听器
		document.removeEventListener('mousemove', handleMouseMove)
		element.removeEventListener('mouseenter', handleMouseEnter)
		element.removeEventListener('mouseleave', handleMouseLeave)
	}
}
