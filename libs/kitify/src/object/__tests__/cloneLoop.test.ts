//@ts-nocheck
import cloneLoop from '../cloneLoop'

describe('cloneLoop', () => {
	it('should clone primitive types', () => {
		expect(cloneLoop(123)).toBe(123)
		expect(cloneLoop('abc')).toBe('abc')
		expect(cloneLoop(true)).toBe(true)
		expect(cloneLoop(null)).toBe(null)
		expect(cloneLoop(undefined)).toBe(undefined)
	})

	it('should clone Date objects', () => {
		const date = new Date()
		const clonedDate = cloneLoop(date)
		expect(clonedDate).toEqual(date)
		expect(clonedDate).not.toBe(date)
	})

	it('should clone RegExp objects', () => {
		const regex = /abc/gi
		const clonedRegex = cloneLoop(regex)
		expect(clonedRegex).toEqual(regex)
		expect(clonedRegex).not.toBe(regex)
	})

	it('should clone simple objects', () => {
		const obj = { a: 1, b: '2', c: true }
		const clonedObj = cloneLoop(obj)
		expect(clonedObj).toEqual(obj)
		expect(clonedObj).not.toBe(obj)
	})

	it('should clone nested objects', () => {
		const obj = {
			a: {
				b: {
					c: 1,
				},
			},
			d: [1, 2, { e: 3 }],
		}
		const clonedObj = cloneLoop(obj)
		expect(clonedObj).toEqual(obj)
		expect(clonedObj).not.toBe(obj)
		expect(clonedObj.a).not.toBe(obj.a)
		expect(clonedObj.d).not.toBe(obj.d)
		expect(clonedObj.d[2]).not.toBe(obj.d[2])
	})

	it('should handle circular references', () => {
		const obj: any = {}
		obj.a = obj
		const clonedObj = cloneLoop(obj)
		expect(clonedObj).toEqual(obj)
		expect(clonedObj).not.toBe(obj)
		expect(clonedObj.a).toBe(clonedObj)
	})

	it('should clone arrays', () => {
		const arr = [1, '2', true, null, undefined, [3, 4]]
		const clonedArr = cloneLoop(arr)
		expect(clonedArr).toEqual(arr)
		expect(clonedArr).not.toBe(arr)
		expect(clonedArr[5]).not.toBe(arr[5])
	})

	it('should clone objects with prototype', () => {
		function Foo(this: any) {
			this.a = 1
		}
		Foo.prototype.b = 2
		const obj = new Foo()
		const clonedObj = cloneLoop(obj)
		expect(clonedObj).toEqual(obj)
		expect(clonedObj).not.toBe(obj)
		expect(Object.getPrototypeOf(clonedObj)).toBe(Foo.prototype)
	})
})
