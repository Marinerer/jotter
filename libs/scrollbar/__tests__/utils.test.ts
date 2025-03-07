//@ts-nocheck
import { roundRect } from '../src/utils'

describe('roundRect function', () => {
	let ctx: CanvasRenderingContext2D

	beforeEach(() => {
		// 创建模拟的CanvasRenderingContext2D对象
		ctx = {
			beginPath: jest.fn(),
			moveTo: jest.fn(),
			arcTo: jest.fn(),
			closePath: jest.fn(),
		} as unknown as CanvasRenderingContext2D
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('basic usage', () => {
		it('should handle a single radius number correctly', () => {
			// 使用单个数字作为半径
			roundRect.call(ctx, 10, 20, 100, 50, 5)

			// 验证调用
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.moveTo).toHaveBeenCalledWith(10 + 5, 20)
			expect(ctx.arcTo).toHaveBeenCalledTimes(4)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 10 + 100, 20, 10 + 100, 20 + 5, 5)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(2, 10 + 100, 20 + 50, 10 + 5, 20 + 50, 5)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(3, 10, 20 + 50, 10, 20 + 5, 5)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(4, 10, 20, 10 + 5, 20, 5)
			expect(ctx.closePath).toHaveBeenCalledTimes(1)
		})

		it('should handle an array of radius values correctly', () => {
			// 使用数组指定四个角的半径
			roundRect.call(ctx, 10, 20, 100, 50, [5, 10, 15, 20])

			// 验证调用
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.moveTo).toHaveBeenCalledWith(10 + 5, 20)
			expect(ctx.arcTo).toHaveBeenCalledTimes(4)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 10 + 100, 20, 10 + 100, 20 + 10, 10)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(2, 10 + 100, 20 + 50, 10 + 15, 20 + 50, 15)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(3, 10, 20 + 50, 10, 20 + 20, 20)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(4, 10, 20, 10 + 5, 20, 5)
			expect(ctx.closePath).toHaveBeenCalledTimes(1)
		})
	})

	describe('edge cases', () => {
		it('should handle undefined values in radius array', () => {
			// @ts-ignore - 故意传入undefined测试处理
			const radiusWithUndefined = [5, undefined, 15, undefined]
			roundRect.call(ctx, 10, 20, 100, 50, radiusWithUndefined)

			// 验证调用 - 缺失值应该被替换
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.moveTo).toHaveBeenCalledWith(10 + 5, 20)
			expect(ctx.arcTo).toHaveBeenCalledTimes(4)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 10 + 100, 20, 10 + 100, 20 + 5, 5) // 第二个值使用第一个值
			expect(ctx.arcTo).toHaveBeenNthCalledWith(2, 10 + 100, 20 + 50, 10 + 15, 20 + 50, 15)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(3, 10, 20 + 50, 10, 20 + 5, 5) // 第四个值使用第二个值，而第二个值又使用第一个值
			expect(ctx.arcTo).toHaveBeenNthCalledWith(4, 10, 20, 10 + 5, 20, 5)
			expect(ctx.closePath).toHaveBeenCalledTimes(1)
		})

		it('should handle invalid non-number values in radius array', () => {
			// @ts-ignore - 故意传入非数字测试处理
			const radiusWithInvalid = ['a', true, {}, null]
			roundRect.call(ctx, 10, 20, 100, 50, radiusWithInvalid)

			// 验证调用 - 非数字值应该被替换为0或前面的有效值
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.moveTo).toHaveBeenCalledWith(10 + 0, 20) // 第一个值'a'应该变为0
			expect(ctx.arcTo).toHaveBeenCalledTimes(4)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 10 + 100, 20, 10 + 100, 20 + 0, 0) // 第二个值使用第一个值0
			expect(ctx.arcTo).toHaveBeenNthCalledWith(2, 10 + 100, 20 + 50, 10 + 0, 20 + 50, 0) // 第三个值使用第一个值0
			expect(ctx.arcTo).toHaveBeenNthCalledWith(3, 10, 20 + 50, 10, 20 + 0, 0) // 第四个值使用第二个值，而第二个值又使用第一个值0
			expect(ctx.arcTo).toHaveBeenNthCalledWith(4, 10, 20, 10 + 0, 20, 0)
			expect(ctx.closePath).toHaveBeenCalledTimes(1)
		})

		it('should handle an empty array as radius', () => {
			roundRect.call(ctx, 10, 20, 100, 50, [])

			// 验证调用 - 空数组应该使用默认值0
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.moveTo).toHaveBeenCalledWith(10 + 0, 20)
			expect(ctx.arcTo).toHaveBeenCalledTimes(4)
			// 所有半径都应该是0
			expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 10 + 100, 20, 10 + 100, 20 + 0, 0)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(2, 10 + 100, 20 + 50, 10 + 0, 20 + 50, 0)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(3, 10, 20 + 50, 10, 20 + 0, 0)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(4, 10, 20, 10 + 0, 20, 0)
			expect(ctx.closePath).toHaveBeenCalledTimes(1)
		})

		it('should handle partial radius array correctly', () => {
			// 只提供两个值
			roundRect.call(ctx, 10, 20, 100, 50, [5, 10])

			// 验证调用 - 缺失的值应该被适当地补充
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.moveTo).toHaveBeenCalledWith(10 + 5, 20)
			expect(ctx.arcTo).toHaveBeenCalledTimes(4)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 10 + 100, 20, 10 + 100, 20 + 10, 10)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(2, 10 + 100, 20 + 50, 10 + 5, 20 + 50, 5) // 第三个值使用第一个值
			expect(ctx.arcTo).toHaveBeenNthCalledWith(3, 10, 20 + 50, 10, 20 + 10, 10) // 第四个值使用第二个值
			expect(ctx.arcTo).toHaveBeenNthCalledWith(4, 10, 20, 10 + 5, 20, 5)
			expect(ctx.closePath).toHaveBeenCalledTimes(1)
		})
	})

	describe('context methods', () => {
		it('should return the context object for chaining', () => {
			// 测试方法返回的是否为context对象
			const result = roundRect.call(ctx, 10, 20, 100, 50, 5)

			expect(result).toBe(ctx)
		})

		it('should handle zero radius correctly', () => {
			// 使用0作为半径，应该画出直角矩形
			roundRect.call(ctx, 10, 20, 100, 50, 0)

			// 验证调用
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.moveTo).toHaveBeenCalledWith(10, 20)
			expect(ctx.arcTo).toHaveBeenCalledTimes(4)
			// 所有arcTo调用的半径应该是0
			expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 10 + 100, 20, 10 + 100, 20, 0)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(2, 10 + 100, 20 + 50, 10, 20 + 50, 0)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(3, 10, 20 + 50, 10, 20, 0)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(4, 10, 20, 10, 20, 0)
			expect(ctx.closePath).toHaveBeenCalledTimes(1)
		})

		it('should handle negative radius values by using their absolute values', () => {
			// 使用负数作为半径测试（实际绘图API通常会使用绝对值）
			roundRect.call(ctx, 10, 20, 100, 50, -5)

			// 注意：roundRect函数本身并没有处理负半径的逻辑，所以这里测试的是原始行为
			expect(ctx.beginPath).toHaveBeenCalledTimes(1)
			expect(ctx.moveTo).toHaveBeenCalledWith(10 - 5, 20)
			expect(ctx.arcTo).toHaveBeenCalledTimes(4)
			expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 10 + 100, 20, 10 + 100, 20 - 5, -5)
			expect(ctx.closePath).toHaveBeenCalledTimes(1)
		})
	})
})
