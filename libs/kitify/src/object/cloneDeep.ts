/**
 * 深度克隆注意事项：
 * 1. 支持深度克隆数据
 * 2. 支持特殊类型数据，如 Map、Set、Date、RegExp、ArrayBuffer、TypedArray、DataView、Symbol 等
 * 3. 循环引用处理
 * 4. 栈溢出处理
 * 5. 性能优化
 */

/**
 * 判断是否为 TypedArray
 */
interface TypedArray extends ArrayBufferView {
	readonly length: number
}

function isTypedArray(obj: any): obj is TypedArray {
	return ArrayBuffer.isView(obj) && !(obj instanceof DataView)
}

/**
 * 克隆 Symbol
 * 1. Symbol 本质上是唯一的，不能真正地"克隆"
 * 2. 对于全局 Symbol（使用 Symbol.for 创建的），直接使用 Symbol.for 重新获取
 * 3. 对于普通 Symbol，创建一个新的 Symbol 实例
 * 4. 在克隆对象时，确保同时处理普通属性和 Symbol 属性及保持属性描述符
 * @param sym 待克隆的 Symbol
 * @returns
 *
 * @warning `Object(Symbol.prototype.valueOf.call(testSymbol))` 是创建一个 Symbol 对象包装器，而不是一个新的 Symbol, 其值与原 Symbol 相同，但类型不同。
 */
// @ts-ignore
function cloneSymbol(sym: symbol): symbol {
	// 对于全局 Symbol，创建一个新的全局 Symbol
	if (Symbol.keyFor(sym)) {
		return Symbol.for(Symbol.keyFor(sym)!)
	}
	// 对于普通 Symbol，创建一个新的普通 Symbol
	return Symbol(sym.description)
}

/**
 * 使用递归方式实现深度克隆，支持各种常见数据类型.
 * @param target 需要克隆的值
 * @param hash 用于存储已经克隆过的对象，避免循环引用问题
 * @returns
 *
 * @warning 对于数据量比较大的对象，可能会出现递归栈溢出。建议其他方案，比如 `cloneLoop` 或 `cloneJSON`。
 */
function deepClone<T>(target: T, hash = new WeakMap()): T {
	// 处理原始类型
	if (target === null || typeof target !== 'object') {
		return target
	}

	// 处理循环引用
	if (hash.has(target)) {
		return hash.get(target)
	}

	// 处理特殊内置类型: Date, RegExp, ArrayBuffer, TypedArray, DataView, Map, Set
	if (target instanceof Date) {
		return new Date(target.getTime()) as any
	}

	if (target instanceof RegExp) {
		return new RegExp(target.source, target.flags) as any
	}

	if (target instanceof ArrayBuffer) {
		const result = new ArrayBuffer(target.byteLength)
		new Uint8Array(result).set(new Uint8Array(target))
		return result as any
	}

	// 处理 TypedArray
	if (isTypedArray(target)) {
		const result = new (target.constructor as any)(target.length)
		result.set(target)
		return result
	}

	// 处理 DataView
	if (target instanceof DataView) {
		const buffer = deepClone(target.buffer)
		return new DataView(buffer, target.byteOffset, target.byteLength) as any
	}

	// 处理 Map 和 Set
	if (target instanceof Map) {
		const result = new Map()
		hash.set(target, result)

		target.forEach((value, key) => {
			// 对 Map 的 key 和 value 都进行深度克隆
			result.set(deepClone(key, hash), deepClone(value, hash))
		})

		return result as any
	}

	if (target instanceof Set) {
		const result = new Set()
		hash.set(target, result)

		target.forEach((value) => {
			result.add(deepClone(value, hash))
		})

		return result as any
	}

	// 处理数组
	if (Array.isArray(target)) {
		const result: any[] = []
		hash.set(target, result)

		for (let i = 0, len = target.length; i < len; i++) {
			result[i] = deepClone(target[i], hash)
		}

		return result as any
	}

	// 处理普通对象及其 Symbol 属性
	if (typeof target === 'object') {
		// 使用 Object.create(Object.getPrototypeOf(target)) 来保留原型链
		const result: any = Object.create(Object.getPrototypeOf(target))
		hash.set(target, result)

		/**
		 * ! 获取所有属性描述符, 但遍历时无法读取 Symbol 属性
		 * 1. Object.keys() 获取对象的可枚举的字符串类型的键
		 * 2. Object.getOwnPropertyNames() 可获取对象自身所有可枚举和不可枚举的字符串类型的键
		 * 3. Object.getOwnPropertySymbols() 获取对象自身所有 Symbol 类型的键
		 * 4. Reflect.ownKeys() 获取对象自身所有键,包括字符串类型、Symbol 类型以及不可枚举的键
		 */
		// const descriptors = Object.getOwnPropertyDescriptors(target)

		// 使用 Reflect.ownKeys 获取对象自身所有键,包括不可枚举属性和Symbol属性
		const props = Reflect.ownKeys(target)
		// 使用 Object.defineProperties 保持属性描述符
		const descriptors = props.reduce((acc, prop) => {
			const descriptor = Object.getOwnPropertyDescriptor(target, prop)!
			descriptor.value = deepClone(descriptor.value, hash)
			acc[prop] = descriptor
			return acc
		}, {} as any)
		Object.defineProperties(result, descriptors)

		return result
	}

	return target
}

export default deepClone
