/**
 * 缓存置换算法：LRU（Least Recently Used 最近最少使用）缓存。
 *
 * LRUCache 类实现了一个最近最少使用（LRU）缓存。
 * 它使用 Map 数据结构来存储键值对，并限制缓存的最大容量。
 * 当缓存达到容量上限时，最久未使用的键值对将被移除。
 */
class LRUCache {
	// 用于存储键值对的 Map 对象
	private cache: Map<string, any>
	// 缓存的最大容量
	private capacity: number

	/**
	 * 构造函数，初始化 LRUCache 实例。
	 * @param capacity - 缓存的最大容量。
	 */
	constructor(capacity: number) {
		this.cache = new Map()
		// 设置缓存的容量
		this.capacity = capacity
	}

	/**
	 * 检查给定的键是否存在于缓存中。
	 * @param key - 要检查的键。
	 * @returns 如果键存在于缓存中，返回 true；否则返回 false。
	 */
	has(key: string): boolean {
		return this.cache.has(key)
	}

	/**
	 * 获取给定键对应的值。
	 * 如果键存在于缓存中，则返回对应的值，并将该键值对移动到缓存的最前面（即最近使用）。
	 * 如果键不存在，则返回 -1。
	 * @param key - 要获取值的键。
	 * @returns 键对应的值，如果键不存在则返回 -1。
	 */
	get(key: string): any {
		if (!this.has(key)) return -1

		const value = this.cache.get(key)
		this.cache.delete(key)
		this.cache.set(key, value)
		return value
	}

	/**
	 * 将键值对放入缓存中。
	 * 如果键已经存在于缓存中，则更新其值，并将该键值对移动到缓存的最前面（即最近使用）。
	 * 如果键不存在且缓存未满，则直接将键值对放入缓存。
	 * 如果键不存在且缓存已满，则移除最久未使用的键值对，并将新的键值对放入缓存。
	 * @param key - 要存储的键。
	 * @param value - 要存储的值。
	 */
	put(key: string, value: any): void {
		if (this.has(key)) {
			this.cache.delete(key) // 删除旧的数据
		} else if (this.cache.size >= this.capacity) {
			const oldestKey = this.cache.keys().next().value as string // 获取最旧的键
			this.cache.delete(oldestKey) // 删除最旧的数据
		}

		this.cache.set(key, value)
	}

	/**
	 * 清空缓存，移除所有键值对。
	 */
	clear(): void {
		this.cache.clear()
	}
}

export default LRUCache
