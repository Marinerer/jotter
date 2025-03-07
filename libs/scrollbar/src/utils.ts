/**
 * 绘制圆角矩形
 * @param {number} x 矩形左上角x坐标
 * @param {number} y 矩形左上角y坐标
 * @param {number} width 矩形宽度
 * @param {number} height 矩形高度
 * @param {number|number[]} radius 圆角半径, [tl, tr, br, bl]
 * @returns
 */
export function roundRect(
	this: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number | number[]
) {
	if (typeof radius === 'number') {
		radius = [radius, radius, radius, radius]
	} else if (Array.isArray(radius)) {
		if (typeof radius[0] !== 'number') {
			radius[0] = 0
		}
		if (typeof radius[1] !== 'number') {
			radius[1] = radius[0]
		}
		if (typeof radius[2] !== 'number') {
			radius[2] = radius[0]
		}
		if (typeof radius[3] !== 'number') {
			radius[3] = radius[1]
		}
	}

	// 开始绘制路径
	this.beginPath()
	// 移动到起点位置
	this.moveTo(x + radius[0], y)
	// 绘制第一个角的圆弧
	this.arcTo(x + width, y, x + width, y + radius[1], radius[1])
	// 绘制第二个角的圆弧
	this.arcTo(x + width, y + height, x + radius[2], y + height, radius[2])
	// 绘制第三个角的圆弧
	this.arcTo(x, y + height, x, y + radius[3], radius[3])
	// 绘制第四个角的圆弧
	this.arcTo(x, y, x + radius[0], y, radius[0])
	// 关闭路径
	this.closePath()

	// 返回当前上下文对象
	return this
}
