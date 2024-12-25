//@ts-nocheck
import cloneDeep from '../cloneDeep'

describe('cloneDeep', () => {
	// 测试原始类型
	test('should clone primitive types', () => {
		expect(cloneDeep(123)).toBe(123)
		expect(cloneDeep('abc')).toBe('abc')
		expect(cloneDeep(true)).toBe(true)
		expect(cloneDeep(null)).toBe(null)
		expect(cloneDeep(undefined)).toBe(undefined)

		const sym = Symbol('sym')
		expect(cloneDeep(sym)).toEqual(sym)
	})

	// 测试日期
	test('should clone Date', () => {
		const date = new Date()
		const clonedDate = cloneDeep(date)
		expect(clonedDate).toEqual(date)
		expect(clonedDate).not.toBe(date)
	})

	// 测试正则表达式
	test('should clone RegExp', () => {
		const regex = /abc/gi
		const clonedRegex = cloneDeep(regex)
		expect(clonedRegex).toEqual(regex)
		expect(clonedRegex).not.toBe(regex)
	})

	// 测试ArrayBuffer
	test('should clone ArrayBuffer', () => {
		const buffer = new ArrayBuffer(8)
		const clonedBuffer = cloneDeep(buffer)
		expect(clonedBuffer).toEqual(buffer)
		expect(clonedBuffer).not.toBe(buffer)
	})

	// 测试TypedArray
	test('should clone TypedArray', () => {
		const typedArray = new Uint8Array([1, 2, 3])
		const clonedTypedArray = cloneDeep(typedArray)
		expect(clonedTypedArray).toEqual(typedArray)
		expect(clonedTypedArray).not.toBe(typedArray)
	})

	// 测试DataView
	test('should clone DataView', () => {
		const buffer = new ArrayBuffer(8)
		const dataView = new DataView(buffer)
		const clonedDataView = cloneDeep(dataView)
		expect(clonedDataView).toEqual(dataView)
		expect(clonedDataView).not.toBe(dataView)
	})

	// 测试Map
	test('should clone Map', () => {
		const map = new Map([
			[1, 'a'],
			[2, 'b'],
		])
		const clonedMap = cloneDeep(map)
		expect(clonedMap).toEqual(map)
		expect(clonedMap).not.toBe(map)
	})

	// 测试Set
	test('should clone Set', () => {
		const set = new Set([1, 2, 3])
		const clonedSet = cloneDeep(set)
		expect(clonedSet).toEqual(set)
		expect(clonedSet).not.toBe(set)
	})

	// 测试数组
	test('should clone Array', () => {
		const array = [1, 2, 3]
		const clonedArray = cloneDeep(array)
		expect(clonedArray).toEqual(array)
		expect(clonedArray).not.toBe(array)
	})

	// 测试普通对象
	test('should clone Object', () => {
		const obj = { a: 1, b: { c: 2 } }
		const clonedObj = cloneDeep(obj)
		expect(clonedObj).toEqual(obj)
		expect(clonedObj).not.toBe(obj)
		expect(clonedObj.b).not.toBe(obj.b)
	})

	// 测试循环引用
	test('should handle circular reference', () => {
		const obj: any = {}
		obj.a = obj
		const clonedObj = cloneDeep(obj)
		expect(clonedObj).toEqual(obj)
		expect(clonedObj).not.toBe(obj)
		expect(clonedObj.a).toBe(clonedObj)
	})

	// 测试Symbol属性
	test('should clone Symbol properties', () => {
		const sym = Symbol('sym')
		const obj = { [sym]: 'value' }
		const clonedObj = cloneDeep(obj)
		expect(clonedObj).toEqual(obj)
		expect(clonedObj).not.toBe(obj)
		expect(clonedObj[sym]).toBe(obj[sym])
	})
})
