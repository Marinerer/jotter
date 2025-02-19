// 判断运行环境
const isNode = typeof window === 'undefined'

// requestIdleCallback的polyfill实现
const requestIdleCallbackPolyfill = (callback) => {
	const start = Date.now()
	return setTimeout(() => {
		callback({
			didTimeout: false,
			timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
		})
	}, 1)
}

// cancelIdleCallback的polyfill实现
const cancelIdleCallbackPolyfill = (id) => {
	clearTimeout(id)
}

// 获取对应环境下的调度函数
const getIdleScheduler = () => {
	if (isNode) {
		// Node.js环境使用 setImmediate 或 setTimeout
		return {
			requestIdle: (callback) =>
				setImmediate(() => {
					const deadline = {
						didTimeout: false,
						timeRemaining: () => 1,
					}
					callback(deadline)
				}),
			cancelIdle: clearImmediate,
		}
	} else {
		// 浏览器环境
		return {
			requestIdle: window.requestIdleCallback || requestIdleCallbackPolyfill,
			cancelIdle: window.cancelIdleCallback || cancelIdleCallbackPolyfill,
		}
	}
}

class IdleTaskScheduler {
	constructor() {
		this.tasks = []
		this.ongoing = false
		const { requestIdle, cancelIdle } = getIdleScheduler()
		this.requestIdle = requestIdle
		this.cancelIdle = cancelIdle
	}

	// 添加任务
	addTask(task, priority = 0) {
		this.tasks.push({ task, priority })
		this.tasks.sort((a, b) => b.priority - a.priority)
		this.scheduleProcessing()
	}

	// 调度任务处理
	scheduleProcessing() {
		if (this.ongoing) return
		this.ongoing = true

		this.requestIdle(this.processTasks.bind(this))
	}

	// 处理任务队列
	processTasks(deadline) {
		while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && this.tasks.length > 0) {
			const { task } = this.tasks.shift()
			try {
				task()
			} catch (error) {
				console.error('Task execution error:', error)
			}
		}

		if (this.tasks.length > 0) {
			// 还有剩余任务，继续调度
			this.requestIdle(this.processTasks.bind(this))
		} else {
			this.ongoing = false
		}
	}

	// 清空任务队列
	clear() {
		this.tasks = []
	}
}

export default IdleTaskScheduler
