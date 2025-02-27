import { IOptions, DrawTextResult } from './types'

declare global {
	interface CanvasRenderingContext2D {
		/**
		 * 在 canvas 上绘制文本，支持自动换行、对齐、样式和布局控制
		 * @param {string} text - 要绘制的文本
		 * @param {number} x - 绘制区域左上角 x 坐标
		 * @param {number} y - 绘制区域左上角 y 坐标
		 * @param {number} width - 绘制区域宽度
		 * @param {number} height - 绘制区域高度
		 * @param {Object} options - 配置选项
		 * @returns {Object} 绘制信息，包含行数、实际宽/高度等
		 */
		drawText(
			text: string,
			x: number = 0,
			y: number = 0,
			width: number,
			height: number,
			options: IOptions = {}
		): DrawTextResult | undefined
	}
}
