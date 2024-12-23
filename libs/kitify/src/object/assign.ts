interface Assign {
	<T extends {}, U>(target: T, source: U): T & U
	<T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V
	<T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W
}

const assign: Assign =
	Object.assign ||
	function (target: Record<keyof any, any>, ...sources: any[]) {
		for (let i = 1, len = sources.length; i < len; i++) {
			const source = sources[i]
			for (const key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key]
				}
			}
		}
	}

export default assign
