/**
 * 使用迭代方式实现深度克隆
 * 1. 暂不支持Symbol、Map、Set等特殊类型
 *
 * @param value 需要克隆的值
 * @returns
 */
function cloneLoop<T>(value: T): T {
	if (value === null || typeof value !== 'object') {
		return value
	}
	// 处理特殊内置类型: Date, RegExp
	if (value instanceof Date) {
		return new Date(value.getTime()) as T
	}
	if (value instanceof RegExp) {
		return new RegExp(value.source, value.flags) as T
	}

	// 创建 WeakMap 用于存储已克隆的对象，防止循环引用
	const map = new WeakMap()
	// 创建一个栈结构,用于存储待克隆的对象及其键路径
	const stack: Array<{
		source: any // 待克隆的对象
		target: any // 克隆后的对象
		keys: string[] // 需要处理的属性键数组
	}> = []

	// 初始化根对象
	const rootTarget = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
	// 将源对象和克隆对象的映射存入 WeakMap
	map.set(value, rootTarget)
	// 将第一个任务推入栈中
	stack.push({
		source: value,
		target: rootTarget,
		keys: Object.keys(value),
	})

	// 核心迭代逻辑
	while (stack.length > 0) {
		// 获取当前栈顶元素，进行克隆操作
		// `pop()` 深度优先, 后进先出
		// `shift()` 广度优先, 先进先出
		const { source, target, keys } = stack.pop()!

		// 遍历当前对象的所有属性
		for (const key of keys) {
			const sourceValue = source[key]

			// 处理基本类型
			if (sourceValue === null || typeof sourceValue !== 'object') {
				target[key] = sourceValue
				continue
			}

			// 处理循环引用
			if (map.has(sourceValue)) {
				target[key] = map.get(sourceValue)
				continue
			}

			// 处理特殊内置类型: Date, RegExp
			if (sourceValue instanceof Date) {
				target[key] = new Date(sourceValue.getTime())
				continue
			}
			if (sourceValue instanceof RegExp) {
				target[key] = new RegExp(sourceValue.source, sourceValue.flags)
				continue
			}

			// 处理数组或对象
			const clonedValue = Array.isArray(sourceValue)
				? []
				: Object.create(Object.getPrototypeOf(sourceValue))

			// 将新的映射关系存入 WeakMap
			map.set(sourceValue, clonedValue)
			// 将克隆后的值赋值给目标对象的属性
			target[key] = clonedValue

			// 将新的任务推入栈中，继续处理其属性
			stack.push({
				source: sourceValue,
				target: clonedValue,
				keys: Object.keys(sourceValue),
			})
		}
	}

	return rootTarget
}

export default cloneLoop

/**
循环是算法的核心，它模拟了递归的过程：
1. 每次从栈中取出一个任务
2. 遍历该对象的所有属性
3. 对每个属性值进行判断和处理：
    3.1 如果是基本类型，直接赋值
    3.2 如果是已经克隆过的对象（在 map 中存在），直接使用已克隆的值
    3.3 如果是新的对象类型：
        3.3.1 创建新的空对象或数组
        3.3.2 将映射关系存入 WeakMap
        3.3.3 将新的克隆任务推入栈中

这种迭代方式的优势：
1. 避免了递归调用导致的调用栈溢出
2. 内存使用更可控，因为任务栈的大小是线性的
3. 在处理非常深的对象结构时更安全

具体示例来过程：
const obj = {
    a: {
        b: {
            c: 1
        }
    },
    d: [1, 2, {e: 3}]
};

// 克隆过程中的栈变化：
// 初始栈：[{source: obj, target: {}, keys: ['a', 'd']}]
// stack length: 1, [root]

// 处理 d 属性时：
// 栈：[{source: obj.d, target: [], keys: ['0', '1', '2']}]
// stack length: 2, ['a', 'd']

// 处理 e 属性时：
// 栈：[{source: {e: 3}, target: {}, keys: ['e']}]
// stack length: 2, ['a', 'e']

// 处理 a 属性时：
// 栈：[{source: obj.a, target: {}, keys: ['b']}]
// stack length: 1, ['a']

// 处理 b 属性时：
// 栈：[{source: obj.a.b, target: {}, keys: ['c']}]
// stack length: 1, ['b]

 */
