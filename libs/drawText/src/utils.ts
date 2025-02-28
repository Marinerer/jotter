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
	// 获取文本实际度量信息，用于计算背景高度
	const textMetrics = ctx.measureText('M') // 使用字母M作为参考
	// 计算基于文本的实际高度
	// 使用 fontBoundingBoxAscent 和 fontBoundingBoxDescent 获取文本上/下半部高度
	// fontBoundingBoxAscent可能不支持，则使用fontSize的0.7倍作为近似
	const textAscent = textMetrics.fontBoundingBoxAscent || fontSize * 0.7
	const textDescent = textMetrics.fontBoundingBoxDescent || fontSize * 0.3
	const actualTextHeight = textAscent + textDescent

	return {
		textAscent,
		textDescent,
		actualTextHeight,
	}
}
