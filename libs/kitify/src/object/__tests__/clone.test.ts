//@ts-nocheck
import clone from '../clone'

describe('clone', () => {
	it('should return the same value for primitive types', () => {
		expect(clone(123)).toBe(123)
		expect(clone('abc')).toBe('abc')
		expect(clone(true)).toBe(true)
		expect(clone(null)).toBe(null)
		expect(clone(undefined)).toBe(undefined)

		const sym = Symbol('sym')
		expect(clone(sym)).toEqual(sym)
	})

	it('should clone Date objects correctly', () => {
		const date = new Date()
		const clonedDate = clone(date)
		expect(clonedDate).toEqual(date)
		expect(clonedDate).not.toBe(date)
	})

	it('should clone RegExp objects correctly', () => {
		const regex = /abc/gi
		const clonedRegex = clone(regex)
		expect(clonedRegex).toEqual(regex)
		expect(clonedRegex).not.toBe(regex)
	})

	it('should handle circular references', () => {
		const obj: any = {}
		obj.self = obj
		const clonedObj = clone(obj)
		expect(clonedObj).not.toBe(obj)
		expect(clonedObj.self).toBe(clonedObj)
	})

	it('should clone arrays correctly', () => {
		const arr = [1, 2, 3, [4, 5]]
		const clonedArr = clone(arr)
		expect(clonedArr).toEqual(arr)
		expect(clonedArr).not.toBe(arr)
		expect(clonedArr[3]).not.toBe(arr[3])
	})

	it('should clone objects with nested objects correctly', () => {
		const obj = { a: 1, b: { c: 2 } }
		const clonedObj = clone(obj)
		expect(clonedObj).toEqual(obj)
		expect(clonedObj).not.toBe(obj)
		expect(clonedObj.a).toBe(obj.a)
		expect(clonedObj.b).not.toBe(obj.b)
	})

	it('should clone objects with prototype chain', () => {
		function Person(name) {
			this.name = name
		}

		Person.prototype.sayHello = function () {
			return 'Hello, ' + this.name
		}

		const person = new Person('John')
		const clonedPerson = clone(person)
		expect(clonedPerson).toEqual(person)
		expect(clonedPerson).not.toBe(person)
		expect(clonedPerson.sayHello()).toBe('Hello, John')
	})
})
