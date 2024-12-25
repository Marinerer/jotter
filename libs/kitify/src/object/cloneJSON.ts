/**
 * 使用 JSON 方法实现深度克隆
 * @param obj 要克隆的对象
 * @returns
 */
export default function cloneJSON<T>(obj: T): T {
	try {
		return JSON.parse(JSON.stringify(obj))
	} catch (error) {
		console.error(error)
		return {} as T
	}
}
