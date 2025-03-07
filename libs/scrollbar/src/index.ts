import { ScrollbarOptions, DeepRequired } from './types'
import { roundRect } from './utils'

const defaultStyle = {
	color: '#000',
	backgroundColor: '#fff',
	radius: 0,
	padding: 0,
}

class CanvasScrollbar {
	private readonly _canvas: HTMLCanvasElement // 画布元素
	private readonly _ctx: CanvasRenderingContext2D // 画布上下文
	private readonly _opts: DeepRequired<ScrollbarOptions> // 滚动条配置项，经过深度必需处理

	// 初始化状态
	private _scrollPosition: number = 0 // 当前滚动位置
	private _isDragging: boolean = false // 是否正在拖拽
	private _startDragY: number = 0 // 开始拖拽时的鼠标位置
	private _startDragX: number = 0 // 开始拖拽时的鼠标位置
	private _startScrollPosition: number = 0 // 开始拖拽时的滚动位置

	/**
	 * constructor
	 * @param {HTMLCanvasElement} canvas canvas对象
	 * @param {object} options 配置项
	 * @param {number} options.x 滚动条绘制区域左上角 x 坐标
	 * @param {number} options.y 滚动条绘制区域左上角 y 坐标
	 * @param {number} options.width 滚动条宽度
	 * @param {number} options.height 滚动条高度
	 * @param {string} options.direction 滚动方向, 可选值: `x|y`
	 * @param {object} options.style 滚动条样式
	 * @param {string} options.style.color 滚动条颜色
	 * @param {string} options.style.backgroundColor 滚动条背景颜色
	 * @param {number} options.style.radius 滚动条圆角
	 * @param {number} options.style.padding 滚动条内边距
	 * @param {number} options.contentSize 内容尺寸
	 * @param {number} options.viewportSize 视口尺寸
	 * @param {function} options.onscroll 滚动事件回调
	 */
	constructor(canvas: HTMLCanvasElement, options: ScrollbarOptions = {}) {
		this._canvas = canvas
		this._ctx = canvas.getContext('2d') as CanvasRenderingContext2D

		// 初始化配置项
		const direction = options.direction !== 'x' ? 'y' : 'x' //方向只能是 x|y
		const _opts: ScrollbarOptions = {
			contentSize: 0,
			onscroll: () => {},
			...options,
			direction,
			style: { ...defaultStyle, ...(options.style || {}) },
		}
		this._opts = this._initOptions(_opts, canvas) as DeepRequired<ScrollbarOptions>

		// 绑定事件处理函数
		this._handleMouseDown = this._handleMouseDown.bind(this)
		this._handleMouseMove = this._handleMouseMove.bind(this)
		this._handleMouseUp = this._handleMouseUp.bind(this)
		this._handleWheel = this._handleWheel.bind(this)

		// 添加事件监听
		this._bindEvents()

		// roundRect polyfill
		if (typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
			CanvasRenderingContext2D.prototype.roundRect = roundRect
		}

		// 当内容区域大于视口区域,绘制滚动条
		if (this._checkShouldScroll()) {
			this.draw()
		}
	}

	// 获取最大滚动距离
	private _getMaxScroll() {
		return this._opts.contentSize - this._opts.viewportSize
	}
	// 获取滑块尺寸
	private _getThumbSize() {
		const { direction, width, height, contentSize, viewportSize } = this._opts
		const scrollbarSize = direction === 'x' ? width : height
		return Math.max(20, (viewportSize / contentSize) * scrollbarSize)
	}

	// 检查是否可以滚动
	private _checkShouldScroll() {
		return this._opts.contentSize > this._opts.viewportSize
	}
	// 检查是否在滚动边界 (delta: 滚动距离)
	private _isAtScrollBoundary(delta: number) {
		const isAtStart = this._scrollPosition <= 0
		const isAtEnd = this._scrollPosition >= this._getMaxScroll()
		return (isAtStart && delta < 0) || (isAtEnd && delta > 0)
	}
	// 检查点是否在滚动条区域内
	private _isPointInScrollbar(x: number, y: number) {
		const { x: scrollX, y: scrollY, width, height } = this._opts
		return x >= scrollX && x <= scrollX + width && y >= scrollY && y <= scrollY + height
	}

	// 初始化选项
	private _initOptions(_opts: ScrollbarOptions, canvas: HTMLCanvasElement) {
		const canvasWidth = canvas.width
		const canvasHeight = canvas.height
		const { direction } = _opts
		if (typeof _opts.width !== 'number') {
			_opts.width = direction === 'y' ? 10 : canvasWidth
		}
		if (typeof _opts.height !== 'number') {
			_opts.height = direction === 'y' ? canvasHeight : 10
		}
		if (typeof _opts.x !== 'number') {
			_opts.x = direction === 'y' ? canvasWidth - _opts.width : 0
		}
		if (typeof _opts.y !== 'number') {
			_opts.y = direction === 'y' ? 0 : canvasHeight - _opts.height
		}
		if (typeof _opts.viewportSize !== 'number') {
			_opts.viewportSize = direction === 'y' ? canvasHeight : canvasWidth
		}
		return _opts
	}

	private _bindEvents() {
		this._canvas.addEventListener('mousedown', this._handleMouseDown)
		this._canvas.addEventListener('wheel', this._handleWheel)
	}

	// 处理鼠标按下事件
	private _handleMouseDown(e: MouseEvent) {
		// 如果内容尺寸小于视口尺寸，禁用滚动
		if (!this._checkShouldScroll()) return

		const rect = this._canvas.getBoundingClientRect()
		const mouseX = e.clientX - rect.left
		const mouseY = e.clientY - rect.top

		// 检查是否点击在滚动条区域内
		if (this._isPointInScrollbar(mouseX, mouseY)) {
			const { direction } = this._opts
			const scrollbarSize = direction === 'x' ? this._opts.width : this._opts.height
			const thumbSize = this._getThumbSize()
			const maxScroll = this._getMaxScroll()
			const thumbPosition = (this._scrollPosition / maxScroll) * (scrollbarSize - thumbSize)
			const mousePosition = direction === 'x' ? mouseX - this._opts.x : mouseY - this._opts.y

			// 检查是否点击在滑块上
			if (mousePosition >= thumbPosition && mousePosition <= thumbPosition + thumbSize) {
				this._isDragging = true
				this._startDragX = mouseX
				this._startDragY = mouseY
				this._startScrollPosition = this._scrollPosition // 记录开始拖拽时的滚动位置

				// 按需绑定 mousemove 和 mouseup 事件
				document.addEventListener('mousemove', this._handleMouseMove)
				document.addEventListener('mouseup', this._handleMouseUp)
			} else {
				// 点击滚动条空白区域，直接跳转到对应位置
				const clickRatio = mousePosition / scrollbarSize // 计算点击位置相对于滚动条的比例
				const newPosition = clickRatio * maxScroll // 根据比例计算新的滚动位置
				this.scrollTo(newPosition)
			}
		}
	}

	// 处理鼠标移动事件
	private _handleMouseMove(e: MouseEvent) {
		// 如果内容尺寸小于视口尺寸，禁用滚动
		if (!this._checkShouldScroll()) return

		// 拖拽状态下
		if (!this._isDragging) return

		// 阻止事件冒泡
		e.stopPropagation()

		const rect = this._canvas.getBoundingClientRect()
		const mouseX = e.clientX - rect.left
		const mouseY = e.clientY - rect.top
		const { direction } = this._opts

		// 计算拖动距离和新的滚动位置
		const delta = direction === 'x' ? mouseX - this._startDragX : mouseY - this._startDragY
		const scrollbarSize = direction === 'x' ? this._opts.width : this._opts.height
		const thumbSize = this._getThumbSize()
		const dragRatio = (scrollbarSize - thumbSize) / this._getMaxScroll()

		const newPosition = this._startScrollPosition + delta / dragRatio
		// 位置边界处理
		if (!this._isAtScrollBoundary(delta)) {
			e.preventDefault()
			this.scrollTo(newPosition)
		} else {
			// 滚动到边界位置后，滚动位置取最大值或最小值
			this._scrollPosition = Math.min(Math.max(newPosition, 0), this._getMaxScroll())
		}
	}

	// 处理鼠标松开事件
	private _handleMouseUp(e: MouseEvent) {
		// 阻止事件冒泡
		e.stopPropagation()

		this._isDragging = false

		// 移除全局事件监听
		document.removeEventListener('mousemove', this._handleMouseMove)
		document.removeEventListener('mouseup', this._handleMouseUp)
	}

	// 处理滚轮事件
	private _handleWheel(e: WheelEvent) {
		// 如果内容尺寸小于视口尺寸，禁用滚动
		if (!this._checkShouldScroll()) return
		// 阻止事件冒泡
		e.stopPropagation()

		// 滚动距离 (shift 双向滚动)
		const delta = this._opts.direction === 'y' || e.shiftKey ? e.deltaY : e.deltaX
		// 检查是否在边界位置
		if (!this._isAtScrollBoundary(delta)) {
			e.preventDefault()
			this.scroll(delta)
		}
	}

	// 绘制滚动条
	draw() {
		const { x, y, width, height, direction, style } = this._opts
		const { color, backgroundColor, radius, padding } = style

		// 清除区域
		this._ctx.clearRect(x, y, width, height)

		// 绘制背景
		this._ctx.fillStyle = backgroundColor!
		this._ctx.beginPath()
		this._ctx.roundRect(x, y, width, height, radius)
		this._ctx.fill()

		// 如果内容尺寸小于视口尺寸，不绘制滑块
		if (!this._checkShouldScroll()) return

		// 计算滑块尺寸和位置
		const scrollbarSize = direction === 'x' ? width : height
		const thumbSize = this._getThumbSize()
		const scrollRatio = this._scrollPosition / this._getMaxScroll()
		const thumbPosition = scrollRatio * (scrollbarSize - thumbSize)

		// 绘制滑块
		this._ctx.fillStyle = color!
		this._ctx.beginPath()
		if (direction === 'x') {
			this._ctx.roundRect(
				x + thumbPosition + padding,
				y + padding,
				thumbSize - padding * 2,
				Math.max(height - padding * 2, 2), // 最小高度 2px 防止看不见
				radius
			)
		} else {
			this._ctx.roundRect(
				x + padding,
				y + thumbPosition + padding,
				Math.max(width - padding * 2, 2), // 最小宽度 2px 防止看不见
				thumbSize - padding * 2,
				radius
			)
		}
		this._ctx.fill()
	}

	// 滚动指定距离
	scroll(delta: number) {
		this.scrollTo(this._scrollPosition + delta)
	}

	// 滚动到指定位置
	scrollTo(position: number) {
		const maxScroll = this._getMaxScroll()
		const oldPosition = this._scrollPosition
		// 限制滚动位置在有效范围内 (0 到 maxScroll)
		this._scrollPosition = Math.max(0, Math.min(position, maxScroll))

		// 只在位置发生变化时触发回调和重绘
		if (oldPosition !== this._scrollPosition) {
			const onscroll = this._opts?.onscroll
			typeof onscroll === 'function' && onscroll(this._scrollPosition, maxScroll)
			this.draw()
		}
	}

	// 更新内容和视口尺寸
	update(contentSize: number, viewportSize: number) {
		if (contentSize > 0) {
			this._opts.contentSize = contentSize
		}
		if (viewportSize > 0) {
			this._opts.viewportSize = viewportSize
		}
		this._scrollPosition = Math.min(this._scrollPosition, contentSize - viewportSize)
		this.draw()
	}

	// 销毁实例，移除事件监听
	destroy() {
		this._canvas.removeEventListener('mousedown', this._handleMouseDown)
		this._canvas.removeEventListener('wheel', this._handleWheel)
	}
}

export default CanvasScrollbar
