import { IOptions, IFont, PaddingResult } from './types'

/**
 * 统一内边距padding参数
 */
export function cssPadding(padding: IOptions['padding']): PaddingResult {
	if (typeof padding === 'number') {
		return [padding, padding, padding, padding]
	} else if (Array.isArray(padding)) {
		if (typeof padding[0] !== 'number') {
			return [0, 0, 0, 0]
		} else {
			if (typeof padding[1] !== 'number') {
				padding[1] = padding[0]
			}
			if (typeof padding[2] !== 'number') {
				padding[2] = padding[0]
			}
			if (typeof padding[3] !== 'number') {
				padding[3] = padding[1]
			}
			return padding as PaddingResult
		}
	}
	return [0, 0, 0, 0]
}

/**
 * 处理字体样式参数
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 上下文
 * @param {string|Object} font - 字体设置
 * @returns {Object} 字体信息，包含字号等
 */
export function processFont(ctx: CanvasRenderingContext2D, font?: IOptions['font']) {
	let fontSize = 16
	let fontFamily = 'Arial'
	let fontWeight = 'normal' as IFont['weight']
	let fontStyle = 'normal'

	if (font) {
		if (typeof font === 'string') {
			ctx.font = font
			// 从字符串中提取字体大小用于计算行高
			const fontSizeMatch = font.match(/\b(\d+(?:\.\d+)?)(px|pt|em|rem)\b/)
			if (fontSizeMatch) {
				fontSize = parseFloat(fontSizeMatch[1])
			}
		} else {
			fontSize = font.size || fontSize
			fontFamily = font.family || fontFamily
			fontWeight = font.weight || fontWeight
			fontStyle = font.style || fontStyle
			ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
		}
	} else {
		ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
	}

	return { fontSize, fontFamily, fontWeight, fontStyle }
}

/**
 * 计算带有字间距的文本宽度
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 上下文
 * @param {string} text - 要测量的文本
 * @param {number} letterSpacing - 字间距
 * @returns {number} 文本宽度
 */
export function measureTextWidth(
	ctx: CanvasRenderingContext2D,
	text: string,
	letterSpacing: number = 0
) {
	if (letterSpacing === 0) {
		return ctx.measureText(text).width
	}

	let width = 0
	for (let i = 0; i < text.length; i++) {
		width += ctx.measureText(text[i]).width
	}

	// 添加字间距（字符数-1个间距）
	width += letterSpacing * (text.length - 1)
	return width
}

/**
 * 计算文本实际高度
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 上下文
 * @param {number} fontSize - 字体大小
 * @returns {number} 文本实际高度信息
 */
export function getTextMetrics(ctx: CanvasRenderingContext2D, fontSize: number) {
	// 使用一个样本字符串，包含上下延伸字符，以获得更准确的高度
	// 'Åy' 包含一个上延伸字符和一个下延伸字符
	const textMetrics = ctx.measureText('Åy')

	// 尝试使用标准 API 获取文本度量
	let textAscent, textDescent, actualTextHeight

	// 检查浏览器是否支持这些属性
	if (
		textMetrics.fontBoundingBoxAscent !== undefined &&
		textMetrics.fontBoundingBoxDescent !== undefined
	) {
		// 优先使用字体边界框属性（更准确）
		textAscent = textMetrics.fontBoundingBoxAscent
		textDescent = textMetrics.fontBoundingBoxDescent
		actualTextHeight = textAscent + textDescent
	} else if (
		textMetrics.actualBoundingBoxAscent !== undefined &&
		textMetrics.actualBoundingBoxDescent !== undefined
	) {
		// 退而求其次使用实际边界框（针对当前文本）
		textAscent = textMetrics.actualBoundingBoxAscent
		textDescent = textMetrics.actualBoundingBoxDescent
		actualTextHeight = textAscent + textDescent
	} else {
		// 如果都不支持，使用基于字体大小的估算
		// 这是一个粗略的估计，实际上不同字体有不同的比例
		textAscent = fontSize * 0.8
		textDescent = fontSize * 0.2
		actualTextHeight = fontSize
	}

	return {
		textAscent,
		textDescent,
		actualTextHeight,
	}
}
