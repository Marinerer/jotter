// 递归实现Required
export type DeepRequired<T> = {
	[K in keyof T]-?: Required<DeepRequired<T[K]>>
}

export interface ScrollbarOptions {
	x?: number
	y?: number
	width?: number
	height?: number
	direction?: 'x' | 'y'
	style?: {
		color?: string
		backgroundColor?: string
		radius?: number
		padding?: number
	}
	contentSize?: number
	viewportSize?: number
	onscroll?: (position: number, maxScroll: number) => any
}
