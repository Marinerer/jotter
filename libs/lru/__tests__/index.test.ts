import LRUCache from '../index'

describe('LRUCache', () => {
	let cache: LRUCache

	beforeEach(() => {
		cache = new LRUCache(2) // 初始化容量为2的LRU缓存
	})

	test('should return -1 when key is not exist', () => {
		expect(cache.get('a')).toBe(-1)
	})

	test('should put and get value correctly', () => {
		cache.put('a', 1)
		expect(cache.get('a')).toBe(1)
	})

	test('should update value correctly', () => {
		cache.put('a', 1)
		cache.put('a', 2)
		expect(cache.get('a')).toBe(2)
	})

	test('should evict the least recently used item when cache is full', () => {
		cache.put('a', 1)
		cache.put('b', 2)
		cache.put('c', 3)
		expect(cache.get('a')).toBe(-1)
		expect(cache.get('b')).toBe(2)
		expect(cache.get('c')).toBe(3)
	})

	test('should move recently used item to the front', () => {
		cache.put('a', 1)
		cache.put('b', 2)
		cache.get('a')
		cache.put('c', 3)
		expect(cache.get('a')).toBe(1)
		expect(cache.get('b')).toBe(-1)
		expect(cache.get('c')).toBe(3)
	})

	test('should clear cache correctly', () => {
		cache.put('a', 1)
		cache.put('b', 2)
		cache.clear()
		expect(cache.get('a')).toBe(-1)
		expect(cache.get('b')).toBe(-1)
	})

	test('should check if key exists correctly', () => {
		cache.put('a', 1)
		expect(cache.has('a')).toBe(true)
		expect(cache.has('b')).toBe(false)
	})
})
