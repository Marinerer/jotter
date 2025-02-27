export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type IFont = {
	family: string
	size: number
	weight:
		| 'normal'
		| 'bold'
		| 'bolder'
		| 'lighter'
		| 100
		| 200
		| 300
		| 400
		| 500
		| 600
		| 700
		| 800
		| 900
	style: string
}

export type PaddingResult = [number, number, number, number]

export interface IOptions {
	/**
	 * 内边距
	 * @default 0
	 */
	padding?: number | [number] | [number, number] | [number, number, number] | PaddingResult

	/**
	 * 文本对齐方式
	 * @default 'left'
	 */
	textAlign?: 'left' | 'center' | 'right'

	/**
	 * 垂直对齐方式
	 * @default 'top'
	 */
	verticalAlign?: 'top' | 'middle' | 'bottom'

	/**
	 * 字体
	 * @default '16px Arial'
	 */
	font?: string | IFont

	/**
	 * 文本颜色
	 * @default '#000'
	 */
	color?: string

	/**
	 * 行高
	 * @default 1.2
	 */
	lineHeight?: number

	/**
	 * 字符间距
	 * @default 0
	 */
	letterSpacing?: number

	/**
	 * 是否自动换行
	 * @default true
	 */
	wrap?: boolean

	/**
	 * 溢出处理
	 * @default 'visible'
	 */
	overflow?: 'visible' | 'hidden'

	/**
	 * 溢出文本显示
	 * @default ''
	 */
	textOverflow?: string
}

export interface DrawTextResult {
	totalLines: number
	lines: number
	maxTextHeight?: number
	maxTextWidth?: number
	textHeight: number
	textWidth: number //可见文本宽度
	availableWidth: number //有效绘制区域宽度
	availableHeight: number //有效绘制区域高度
	overflow: boolean
}
