import assign from '../assign'

describe('assign()', () => {
	it('should return an object', () => {
		expect(assign({}, {})).toEqual({})
		expect(assign({}, {}, {})).toEqual({})
	})

	it('should return an object with properties from all input objects', () => {
		const target = { a: 1 }
		const source1 = { b: 2 }
		const source2 = { c: 3 }
		const result = assign(target, source1, source2)
		expect(result).toEqual({ a: 1, b: 2, c: 3 })
	})

	it('should overwrite properties in target object with properties from input objects', () => {
		const target = { a: 1, b: 2 }
		const source1 = { b: 3, c: 4 }
		const source2 = { c: 5 }
		const result = assign(target, source1, source2)
		expect(result).toEqual({ a: 1, b: 3, c: 5 })
	})

	it('should throw an error if target input is undefined or null', () => {
		expect(() => assign(undefined as any, { a: 1 })).toThrow(TypeError)
		expect(() => assign(null as any, { a: 1 })).toThrow(TypeError)
	})

	it('should change source object or not', () => {
		const target = {}
		const source1 = { a: 1 }
		expect(assign(target, source1) === target).toBe(true)
		expect(assign({}, target, source1) === target).toBe(false)
		expect(assign(target, source1) === source1).toBe(false)
		expect(assign(target, source1)).toEqual(source1)
	})
})
