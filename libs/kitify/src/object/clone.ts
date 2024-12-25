/**
 * 递归方式深度克隆 (轻量级)
 * 1. 实现原始类型和对象的深度克隆，支持Date、RegExp类型，以及循环引用的处理。
 * 2. 需要支持 Map、Set、Symbol等特殊类型的克隆，请使用 `cloneDeep` 函数。
 * 3. 对于大量数据对象的克隆，建议使用 `cloneLoop` 函数。
 *
 * @param obj 要克隆的对象
 * @param hash 用于存储已经克隆过的对象，避免循环引用问题
 * @returns
 */
function clone<T>(obj: T, hash = new WeakMap()): T {
	// 处理原始类型
	if (typeof obj !== 'object' || obj === null) return obj

	// 处理日期和正则表达式
	if (obj instanceof Date) return new Date(obj) as any
	if (obj instanceof RegExp) return new RegExp(obj) as any

	// 处理循环引用
	if (hash.has(obj)) return hash.get(obj)

	// 创建克隆对象
	const cloneObj = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj))

	// 将当前对象添加到哈希表中
	hash.set(obj, cloneObj)

	// 递归克隆对象属性
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			;(cloneObj as any)[key] = clone(obj[key], hash)
		}
	}

	return cloneObj as T
}

export default clone
