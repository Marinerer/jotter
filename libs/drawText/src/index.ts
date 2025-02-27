/**
 * `canvas-draw-text`
 * 在 canvas 上绘制文本，支持自动换行、对齐、样式和布局控制:
 * 1. 自动换行：根据可用空间计算文本宽度并自动换行
 * 2. 对齐方式：支持左/中/右的水平对齐和上/中/下的垂直对齐
 * 3. 文本样式：支持自定义颜色、字体、大小、粗细等
 * 4. 布局控制：支持内边距、行高和字间距设置
 * 5. 区域限制：确保文本在指定区域内绘制，通过 `overflow` 控制超出部分处理
 * 6. 绘制数据：返回包含行数、实际高度等绘制信息
 *
 * 注意项：
 * 1. 只对需要计算字间距的文本进行逐字绘制
 * 2. 溢出时仅在需要裁剪时设置裁剪区域 (在最后一行追加溢出替换内容)
 * 3. 针对中文和英文分别采用不同的分词策略
 * 4. 支持换行符 `\n` 的处理
 * 4. 避免重复计算，如行高和字体大小
 * 5. 使用 `ctx.save()` 和 `ctx.restore()` 确保上下文状态不被污染
 */

import { cssPadding, processFont, measureTextWidth } from './utils'
import type { IOptions, DrawTextResult } from './types'

// 重载签名
function drawText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	options?: IOptions
): DrawTextResult | undefined
function drawText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	width: number,
	height: number,
	options?: IOptions
): DrawTextResult | undefined

/**
 * 在 canvas 上绘制文本，支持自动换行、对齐、样式和布局控制
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 上下文
 * @param {string} text - 要绘制的文本
 * @param {number} x - 绘制区域左上角 x 坐标
 * @param {number} y - 绘制区域左上角 y 坐标
 * @param {number} width - 绘制区域宽度
 * @param {number} height - 绘制区域高度
 * @param {Object} options - 配置选项
 * @param {string|number|Array} [options.padding=0] - 内边距，单值或[上,右,下,左]
 * @param {string} [options.textAlign='left'] - 水平对齐方式 ('left', 'center', 'right')
 * @param {string} [options.verticalAlign='top'] - 垂直对齐方式 ('top', 'middle', 'bottom')
 * @param {string|Object} [options.font] - 字体样式设置，字符串或对象 (`16px Arial` | `{ size, family, weight, style }`)
 * @param {string} [options.color='#000'] - 文本颜色
 * @param {number} [options.lineHeight=1.2] - 行高倍数
 * @param {number} [options.letterSpacing=0] - 字间距
 * @param {boolean} [options.wrap=true] - 是否自动换行
 * @param {string} [options.overflow='visible'] - 溢出处理方式: 'visible', 'hidden'
 * @param {string} [options.textOverflow=''] - 文本溢出显示的字符串，如 '...'
 * @returns {Object} 绘制信息，包含行数、实际宽/高度等
 */
function drawText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number = 0,
	y: number = 0,
	width?: number | IOptions,
	height?: number,
	options?: IOptions
): DrawTextResult | undefined {
	// 参数校验
	if (
		!ctx ||
		!ctx.canvas ||
		typeof text !== 'string' ||
		typeof x !== 'number' ||
		typeof y !== 'number'
	) {
		console.error('Invalid arguments')
		return
	}

	if (typeof width !== 'number') {
		const canvas = ctx.canvas
		width = canvas.width
		height = canvas.height

		if (typeof width === 'object') {
			options = width
		}
	}

	if (typeof options !== 'object') {
		options = {}
	}

	// 默认选项
	const defaultOptions: IOptions = {
		padding: 0,
		// font: '16px Arial',
		textAlign: 'left',
		verticalAlign: 'top',
		color: '#000',
		lineHeight: 1.2,
		letterSpacing: 0,
		wrap: true,
		overflow: 'visible',
		textOverflow: '',
	}
	// 合并选项
	options = { ...defaultOptions, ...options }

	// 处理内边距
	const [paddingTop, paddingRight, paddingBottom, paddingLeft] = cssPadding(options.padding)

	// 计算实际可用区域
	const availableWidth = width - paddingLeft - paddingRight
	const availableHeight = height! - paddingTop - paddingBottom

	// 确保可用区域为正数
	if (availableWidth <= 0 || availableHeight <= 0) {
		return {
			lines: 0,
			totalLines: 0,
			availableWidth,
			availableHeight,
			overflow: false,
			textWidth: 0,
			textHeight: 0,
		}
	}

	// 设置字体
	const { fontSize } = processFont(ctx, options.font)
	// 设置文本颜色
	ctx.fillStyle = options.color!
	// 处理字间距
	const letterSpacing = options.letterSpacing!
	// 计算行高（像素）
	const lineHeight = fontSize * options.lineHeight!

	// 将文本按换行符分割
	const paragraphs = text.split('\n')
	// 存储每行文本
	let lines = []
	// 存储每行文本的宽度
	let lineWidths = []

	// 计算每行内容，处理自动换行
	for (let i = 0, len = paragraphs.length; i < len; i++) {
		const paragraph = paragraphs[i]
		if (paragraph.length === 0) {
			lines.push('') // 保留空行
			lineWidths.push(0) // 空行宽度为0
			continue
		}

		// 根据 wrap 选项决定是否自动换行
		if (options.wrap) {
			let words = []

			// 如果是中文或其他没有明确单词分隔的语言，按字符分割
			// 如果是英文或有单词概念的语言，按单词分割
			if (/[\u4e00-\u9fa5]/.test(paragraph)) {
				// 中文等文字按字符分割
				words = paragraph.split('')
			} else {
				// 英文等按单词分割
				words = paragraph.split(' ')
			}

			let currentLine = ''
			let testLine = ''

			for (let i = 0; i < words.length; i++) {
				const word = words[i]

				if (currentLine.length > 0) {
					testLine = currentLine + (/[\u4e00-\u9fa5]/.test(paragraph) ? '' : ' ') + word
				} else {
					testLine = word
				}

				// 计算加上字间距后的文本宽度
				let lineWidth = measureTextWidth(ctx, testLine, letterSpacing)

				if (lineWidth > availableWidth && currentLine.length > 0) {
					lines.push(currentLine)
					lineWidths.push(measureTextWidth(ctx, currentLine, letterSpacing))
					currentLine = word
				} else {
					currentLine = testLine
				}
			}

			if (currentLine.length > 0) {
				lines.push(currentLine)
				lineWidths.push(measureTextWidth(ctx, currentLine, letterSpacing))
			}
		} else {
			// 不自动换行，直接添加整行
			lines.push(paragraph)
			lineWidths.push(measureTextWidth(ctx, paragraph, letterSpacing))
		}
	}

	// 确定是否有溢出 (不是配置项，是计算结果)
	let hasOverflow = false
	const totalTextHeight = lines.length * lineHeight
	let visibleLines = [...lines] // 复制一份，避免修改原数组
	let visibleLineWidths = [...lineWidths] // 复制行宽数组

	// 水平溢出处理
	if (!options.wrap) {
		// 当不自动换行时，处理水平溢出
		for (let i = 0; i < visibleLines.length; i++) {
			const line = visibleLines[i]
			const lineWidth = visibleLineWidths[i]

			// 检查是否有水平溢出
			if (lineWidth > availableWidth) {
				hasOverflow = true

				// 如果是 hidden 模式，处理截断
				if (options.overflow === 'hidden' && options.textOverflow) {
					// 计算需要裁剪的文本
					// const ellipsisWidth = measureTextWidth(ctx, options.textOverflow, letterSpacing)
					let truncatedLine = line

					// 减去字符直到行宽度 + 省略号宽度 <= 可用宽度
					while (truncatedLine.length > 0) {
						const currentWidth = measureTextWidth(
							ctx,
							truncatedLine + options.textOverflow,
							letterSpacing
						)
						if (currentWidth <= availableWidth) {
							break
						}
						// 去掉最后一个字符
						truncatedLine = truncatedLine.slice(0, -1)
					}

					// 更新行内容和宽度
					visibleLines[i] = truncatedLine + options.textOverflow
					visibleLineWidths[i] = measureTextWidth(ctx, visibleLines[i], letterSpacing)
				}
			}
		}
	}

	// 垂直溢出处理
	if (totalTextHeight > availableHeight) {
		hasOverflow = true

		if (options.overflow === 'hidden') {
			// 计算可以显示的行数
			const maxLines = Math.floor(availableHeight / lineHeight)

			// 截断超出高度的行
			visibleLines = visibleLines.slice(0, maxLines)
			visibleLineWidths = visibleLineWidths.slice(0, maxLines)

			// 如果有溢出且设置了 textOverflow，在最后一行添加省略号
			//! 注意: 如果 wrap=false 时, 最后一行溢出显示已处理
			if (
				visibleLines.length < lines.length &&
				visibleLines.length > 0 &&
				options.textOverflow &&
				options.wrap
			) {
				const lastLineIndex = visibleLines.length - 1
				const lastLine = visibleLines[lastLineIndex]
				const ellipsis = options.textOverflow

				// 计算带省略号的最后一行
				let truncatedLine = lastLine
				// const ellipsisWidth = measureTextWidth(ctx, ellipsis, letterSpacing)

				// 减去字符直到最后一行 + 省略号的宽度小于可用宽度
				while (truncatedLine.length > 0) {
					const lineWidth = measureTextWidth(ctx, truncatedLine + ellipsis, letterSpacing)
					if (lineWidth <= availableWidth) {
						break
					}
					// 去掉最后一个字符
					truncatedLine = truncatedLine.slice(0, -1)
				}

				// 更新最后一行，添加省略号
				visibleLines[lastLineIndex] = truncatedLine + ellipsis
				visibleLineWidths[lastLineIndex] = measureTextWidth(
					ctx,
					visibleLines[lastLineIndex],
					letterSpacing
				)
			}
		}
	}

	// 计算起始 y 位置（根据垂直对齐方式）
	let startY = y + paddingTop
	const textHeight = visibleLines.length * lineHeight

	if (options.verticalAlign === 'middle') {
		startY = y + paddingTop + (availableHeight - textHeight) / 2
	} else if (options.verticalAlign === 'bottom') {
		startY = y + paddingTop + availableHeight - textHeight
	}

	// 保存当前环境
	ctx.save()

	// 设置裁剪区域，确保不会绘制到边界外
	if (options.overflow === 'hidden') {
		ctx.beginPath()

		// 裁剪区域应该是文本绘制的可用区域，不包括内边距
		const clipX = x + paddingLeft
		const clipY = y + paddingTop
		const clipWidth = availableWidth
		const clipHeight = availableHeight

		ctx.rect(clipX, clipY, clipWidth, clipHeight)
		ctx.clip()
	}

	// 绘制文本
	for (let i = 0; i < visibleLines.length; i++) {
		const line = visibleLines[i]
		const lineWidth = visibleLineWidths[i]
		let lineX = x + paddingLeft

		// 根据水平对齐方式调整 x 位置
		if (options.textAlign === 'center') {
			lineX = x + paddingLeft + (availableWidth - lineWidth) / 2
		} else if (options.textAlign === 'right') {
			lineX = x + paddingLeft + availableWidth - lineWidth
		}

		// 绘制当前行
		if (letterSpacing === 0) {
			// 没有字间距，直接绘制
			ctx.fillText(line, lineX, startY + i * lineHeight + fontSize)
		} else {
			// 有字间距，需要逐字绘制
			let currentX = lineX
			for (let j = 0; j < line.length; j++) {
				ctx.fillText(line[j], currentX, startY + i * lineHeight + fontSize)
				currentX += ctx.measureText(line[j]).width + letterSpacing
			}
		}
	}

	// 恢复环境
	ctx.restore()

	// 计算文本最大行宽度
	let maxLineWidth = 0
	for (let i = 0, len = lineWidths.length; i < len; i++) {
		const width = lineWidths[i]
		if (width > maxLineWidth) {
			maxLineWidth = width
		}
	}
	// 计算可见文本最大行宽度
	let maxVisibleWidth = 0
	for (let i = 0, len = visibleLineWidths.length; i < len; i++) {
		const width = visibleLineWidths[i]
		if (width > maxVisibleWidth) {
			maxVisibleWidth = width
		}
	}

	// 返回绘制信息
	return {
		totalLines: lines.length,
		lines: visibleLines.length,
		maxTextHeight: totalTextHeight,
		maxTextWidth: maxLineWidth,
		textHeight: lineHeight * visibleLines.length, //可见文本高度
		textWidth: maxVisibleWidth, //可见文本宽度
		availableWidth, //有效绘制区域宽度
		availableHeight, //有效绘制区域高度
		overflow: hasOverflow,
	}
}

/**
 * 扩展 CanvasRenderingContext2D 原型 drawText 方法
 */
drawText.use = function () {
	if (!CanvasRenderingContext2D) {
		console.error('[drawText] CanvasRenderingContext2D not found.')
		return
	}

	if (typeof CanvasRenderingContext2D.prototype.drawText !== 'undefined') {
		console.warn('[drawText] CanvasRenderingContext2D.prototype.drawText already exists.')
		return
	}

	CanvasRenderingContext2D.prototype.drawText = function (
		text: string,
		x: number = 0,
		y: number = 0,
		width: number,
		height: number,
		options: IOptions = {}
	) {
		return drawText.call(this, this, text, x, y, width, height, options)
	}
}

export default drawText
