//@ts-nocheck
import CanvasScrollbar from '../src/index'

// Mock roundRect from utils
jest.mock('../src/utils', () => ({
	roundRect: jest.fn(),
}))

describe('CanvasScrollbar', () => {
	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	let scrollbar: CanvasScrollbar

	// 创建基本mock和设置
	beforeEach(() => {
		// 创建canvas元素和上下文的模拟
		canvas = document.createElement('canvas') as HTMLCanvasElement
		canvas.width = 500
		canvas.height = 300

		ctx = {
			clearRect: jest.fn(),
			fillStyle: '',
			beginPath: jest.fn(),
			roundRect: jest.fn(),
			fill: jest.fn(),
		} as unknown as CanvasRenderingContext2D

		// 模拟canvas.getContext
		jest.spyOn(canvas, 'getContext').mockReturnValue(ctx)

		// 模拟getBoundingClientRect
		canvas.getBoundingClientRect = jest.fn().mockReturnValue({
			left: 0,
			top: 0,
			width: 500,
			height: 300,
		})

		// 添加roundRect polyfill
		if (typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
			CanvasRenderingContext2D.prototype.roundRect = jest.fn()
		}

		// 创建一个基本的滚动条实例
		scrollbar = new CanvasScrollbar(canvas, {
			contentSize: 1000,
			viewportSize: 300,
			direction: 'y',
			style: {
				color: '#333',
				backgroundColor: '#eee',
				radius: 5,
				padding: 2,
			},
			onscroll: jest.fn(),
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
		scrollbar.destroy()
	})

	describe('Constructor and Initialization', () => {
		it('should initialize with default options when minimal options provided', () => {
			const minimalScrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
			})

			expect(minimalScrollbar).toBeDefined()
			// 验证draw被调用
			expect(ctx.clearRect).toHaveBeenCalled()
		})

		it('should initialize with x direction correctly', () => {
			const horizontalScrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
				direction: 'x',
			})

			expect(horizontalScrollbar).toBeDefined()
			expect(ctx.clearRect).toHaveBeenCalled()
		})

		it('should calculate position values correctly when not provided', () => {
			const scrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
			})

			// x应该是canvas宽度减去滚动条宽度
			expect(ctx.clearRect).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				expect.any(Number),
				expect.any(Number)
			)
		})

		it('should not draw scrollbar when content size is less than viewport size', () => {
			// 重置模拟
			jest.clearAllMocks()

			// 创建一个内容小于视口的滚动条
			const noScrollNeeded = new CanvasScrollbar(canvas, {
				contentSize: 200,
				viewportSize: 300,
			})

			// 背景应该被绘制，但滑块不会
			expect(ctx.clearRect).not.toHaveBeenCalled()
			expect(ctx.roundRect).not.toHaveBeenCalled()

			noScrollNeeded.draw()
			expect(ctx.clearRect).toHaveBeenCalled()
			expect(ctx.roundRect).toHaveBeenCalledTimes(1) // 只设置一次fillStyle（背景）
		})
	})

	describe('Drawing Methods', () => {
		it('should draw scrollbar correctly', () => {
			jest.clearAllMocks()

			scrollbar.draw()

			// 检查是否清除了区域
			expect(ctx.clearRect).toHaveBeenCalled()

			// 检查背景和滑块的绘制
			expect(ctx.beginPath).toHaveBeenCalledTimes(2)
			expect(ctx.roundRect).toHaveBeenCalledTimes(2)
			expect(ctx.fill).toHaveBeenCalledTimes(2)
		})

		it('should draw only background when content fits viewport', () => {
			// 重置模拟
			jest.clearAllMocks()

			// 更新为内容小于视口
			scrollbar.update(200, 300)

			// 检查只绘制了背景
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.roundRect).toHaveBeenCalledTimes(1)
			expect(ctx.fill).toHaveBeenCalledTimes(1)
		})
	})

	describe('Scrolling Methods', () => {
		it('should scroll to a specific position', () => {
			const onscrollMock = jest.fn()
			scrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
				viewportSize: 300,
				onscroll: onscrollMock,
			})

			jest.clearAllMocks()

			scrollbar.scrollTo(200)

			// 验证位置更新和回调触发
			expect(onscrollMock).toHaveBeenCalledWith(200, 700)
			expect(ctx.clearRect).toHaveBeenCalled() // 确认重绘
		})

		it('should not trigger onscroll when position does not change', () => {
			const onscrollMock = jest.fn()
			scrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
				viewportSize: 300,
				onscroll: onscrollMock,
			})

			// 先滚动到某个位置
			scrollbar.scrollTo(200)

			jest.clearAllMocks()

			// 再次滚动到相同位置
			scrollbar.scrollTo(200)

			// 验证回调和重绘没有触发
			expect(onscrollMock).not.toHaveBeenCalled()
			expect(ctx.clearRect).not.toHaveBeenCalled()
		})

		it('should handle scroll method correctly', () => {
			const onscrollMock = jest.fn()
			scrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
				viewportSize: 300,
				onscroll: onscrollMock,
			})

			jest.clearAllMocks()

			// 使用相对滚动
			scrollbar.scroll(100)

			// 验证位置更新和回调触发
			expect(onscrollMock).toHaveBeenCalledWith(100, 700)
		})

		it('should limit scrolling to valid range', () => {
			const onscrollMock = jest.fn()
			scrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
				viewportSize: 300,
				onscroll: onscrollMock,
			})

			scrollbar.scroll(10) //先改变初始值;若滚动距离未变化，不会执行事件
			// 尝试滚动到负值
			scrollbar.scrollTo(-100)

			// 应该被限制在0
			expect(onscrollMock).toHaveBeenCalledWith(0, 700)

			jest.clearAllMocks()

			// 尝试滚动超过最大值
			scrollbar.scrollTo(1000)

			// 应该被限制在最大值
			expect(onscrollMock).toHaveBeenCalledWith(700, 700)
		})
	})

	describe('Update Method', () => {
		it('should update content and viewport sizes', () => {
			jest.clearAllMocks()

			scrollbar.update(2000, 500)

			// 验证重绘
			expect(ctx.clearRect).toHaveBeenCalled()
		})

		it('should limit scroll position after resize', () => {
			// 先滚动到某个位置
			scrollbar.scrollTo(500)

			// 然后更新内容和视口大小
			scrollbar.update(600, 400)

			// 滚动位置应该被限制在新的最大值 (600-400=200)
			expect(scrollbar['_scrollPosition']).toBe(200)
		})

		it('should ignore invalid size values', () => {
			const originalContentSize = scrollbar['_opts'].contentSize
			const originalViewportSize = scrollbar['_opts'].viewportSize

			// 提供无效值
			scrollbar.update(-100, -200)

			// 应该保持原来的值
			expect(scrollbar['_opts'].contentSize).toBe(originalContentSize)
			expect(scrollbar['_opts'].viewportSize).toBe(originalViewportSize)
		})
	})

	describe('Event Handling', () => {
		it('should handle mouse down on thumb correctly', () => {
			// 模拟事件
			const mouseEvent = new MouseEvent('mousedown', {
				clientX: 490, // 接近滚动条的X位置
				clientY: 30, // 接近滑块的位置
			})

			// 模拟document事件
			document.addEventListener = jest.fn()

			// 调用事件处理函数
			scrollbar['_handleMouseDown'](mouseEvent)

			// 验证拖拽状态设置
			expect(scrollbar['_isDragging']).toBe(true)
			expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
			expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
		})

		it('should handle mouse down on track correctly', () => {
			const onscrollMock = jest.fn()
			scrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
				viewportSize: 300,
				onscroll: onscrollMock,
				x: 490,
				width: 10,
			})

			jest.clearAllMocks()

			// 模拟点击滚动条轨道（不是滑块）
			const mouseEvent = new MouseEvent('mousedown', {
				clientX: 495, // 滚动条中间
				clientY: 150, // 中间位置，滑块之外
			})

			// 调用事件处理函数
			scrollbar['_handleMouseDown'](mouseEvent)

			// 验证滚动位置直接跳转
			expect(onscrollMock).toHaveBeenCalled()
		})

		it('should handle mouse move during drag correctly', () => {
			// 设置拖拽状态
			scrollbar['_isDragging'] = true
			scrollbar['_startDragY'] = 30
			scrollbar['_startScrollPosition'] = 100

			const onscrollMock = jest.fn()
			scrollbar['_opts'].onscroll = onscrollMock

			// 模拟鼠标移动
			const mouseMoveEvent = new MouseEvent('mousemove', {
				clientX: 495,
				clientY: 50, // 向下移动20px
			})

			mouseMoveEvent.preventDefault = jest.fn()
			mouseMoveEvent.stopPropagation = jest.fn()

			// 调用事件处理函数
			scrollbar['_handleMouseMove'](mouseMoveEvent)

			// 验证滚动位置更新
			expect(onscrollMock).toHaveBeenCalled()
			expect(mouseMoveEvent.preventDefault).toHaveBeenCalled()
			expect(mouseMoveEvent.stopPropagation).toHaveBeenCalled()
		})

		it('should handle mouse up correctly', () => {
			// 设置拖拽状态
			scrollbar['_isDragging'] = true

			// 模拟document事件
			document.removeEventListener = jest.fn()

			const mouseUpEvent = new MouseEvent('mouseup')
			mouseUpEvent.stopPropagation = jest.fn()

			// 调用事件处理函数
			scrollbar['_handleMouseUp'](mouseUpEvent)

			// 验证拖拽状态重置
			expect(scrollbar['_isDragging']).toBe(false)
			expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
			expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
			expect(mouseUpEvent.stopPropagation).toHaveBeenCalled()
		})

		it('should handle wheel event correctly', () => {
			const onscrollMock = jest.fn()
			scrollbar['_opts'].onscroll = onscrollMock

			const wheelEvent = new WheelEvent('wheel', {
				deltaY: 100,
			})

			wheelEvent.preventDefault = jest.fn()
			wheelEvent.stopPropagation = jest.fn()

			// 调用事件处理函数
			scrollbar['_handleWheel'](wheelEvent)

			// 验证滚动位置更新
			expect(onscrollMock).toHaveBeenCalled()
			expect(wheelEvent.preventDefault).toHaveBeenCalled()
			expect(wheelEvent.stopPropagation).toHaveBeenCalled()
		})

		it('should not prevent default when at scroll boundary', () => {
			// 先滚动到最大位置
			scrollbar.scrollTo(700) // 内容大小1000，视口300，最大滚动700

			const wheelEvent = new WheelEvent('wheel', {
				deltaY: 100, // 尝试继续向下滚动
			})

			wheelEvent.preventDefault = jest.fn()
			wheelEvent.stopPropagation = jest.fn()

			// 调用事件处理函数
			scrollbar['_handleWheel'](wheelEvent)

			// 不应该阻止默认行为，因为已经在边界
			expect(wheelEvent.preventDefault).not.toHaveBeenCalled()
		})

		it('should handle horizontal wheel event with shift key', () => {
			// 创建水平滚动条
			const horizontalScrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
				viewportSize: 300,
				direction: 'x',
			})

			const wheelEvent = new WheelEvent('wheel', {
				deltaX: 100,
				deltaY: 100,
				shiftKey: true,
			})

			wheelEvent.preventDefault = jest.fn()
			wheelEvent.stopPropagation = jest.fn()

			// 调用事件处理函数
			horizontalScrollbar['_handleWheel'](wheelEvent)

			// 验证滚动位置更新
			expect(wheelEvent.preventDefault).toHaveBeenCalled()
		})
	})

	describe('Utility Methods', () => {
		it('should check if point is in scrollbar area', () => {
			scrollbar = new CanvasScrollbar(canvas, {
				contentSize: 1000,
				viewportSize: 300,
				x: 490,
				y: 0,
				width: 10,
				height: 300,
			})

			// 点在滚动条区域内
			expect(scrollbar['_isPointInScrollbar'](495, 150)).toBe(true)

			// 点在滚动条区域外
			expect(scrollbar['_isPointInScrollbar'](100, 150)).toBe(false)
		})

		it('should check scroll boundary correctly', () => {
			scrollbar.scrollTo(0) // 滚动到顶部

			// 向上滚动，应该在边界
			expect(scrollbar['_isAtScrollBoundary'](-10)).toBe(true)

			// 向下滚动，不在边界
			expect(scrollbar['_isAtScrollBoundary'](10)).toBe(false)

			scrollbar.scrollTo(700) // 滚动到底部

			// 向上滚动，不在边界
			expect(scrollbar['_isAtScrollBoundary'](-10)).toBe(false)

			// 向下滚动，在边界
			expect(scrollbar['_isAtScrollBoundary'](10)).toBe(true)
		})

		it('should calculate thumb size correctly', () => {
			// 内容1000，视口300，滚动条高度300，比例30%
			expect(scrollbar['_getThumbSize']()).toBe(90)

			// 更新为更大的内容和更小的视口
			scrollbar.update(10000, 100)

			// 更新后比例1%，但最小为20px
			expect(scrollbar['_getThumbSize']()).toBe(20)
		})
	})

	describe('Destroy Method', () => {
		it('should remove event listeners when destroyed', () => {
			// 模拟removeEventListener
			canvas.removeEventListener = jest.fn()

			scrollbar.destroy()

			// 验证事件监听被移除
			expect(canvas.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function))
			expect(canvas.removeEventListener).toHaveBeenCalledWith('wheel', expect.any(Function))
		})
	})
})
