// 任务状态枚举
const TaskStatus = {
	PENDING: 'pending',
	RUNNING: 'running',
	COMPLETED: 'completed',
	FAILED: 'failed',
	CANCELLED: 'cancelled',
	TIMEOUT: 'timeout',
}

// 任务配置默认值
const DEFAULT_TASK_CONFIG = {
	priority: 0,
	timeout: 5000,
}

class IdleTaskScheduler {
	constructor(options = {}) {
		this.tasks = new Map() // 使用Map存储任务，便于根据ID查找
		this.ongoing = false
		this.taskCounter = 0
		this.listeners = new Map()

		// 配置项
		this.config = {
			defaultTimeout: options.defaultTimeout || DEFAULT_TASK_CONFIG.timeout,
			...options,
		}

		const { requestIdle, cancelIdle } = this.getIdleScheduler()
		this.requestIdle = requestIdle
		this.cancelIdle = cancelIdle
	}

	// 获取调度器
	getIdleScheduler() {
		const isNode = typeof window === 'undefined'
		if (isNode) {
			return {
				requestIdle: (callback) =>
					setImmediate(() => {
						callback({
							didTimeout: false,
							timeRemaining: () => 1,
						})
					}),
				cancelIdle: clearImmediate,
			}
		}

		// 使用 requestAnimationFrame 实现的 polyfill
		const requestIdleCallbackPolyfill = (callback) => {
			return requestAnimationFrame(() => {
				const start = performance.now()
				callback({
					didTimeout: false,
					timeRemaining: () => Math.max(0, 16.666 - (performance.now() - start)),
				})
			})
		}

		return {
			requestIdle: window.requestIdleCallback || requestIdleCallbackPolyfill,
			cancelIdle: window.cancelIdleCallback || cancelAnimationFrame,
		}
	}

	// 添加任务
	addTask(taskFn, config = {}) {
		const taskId = ++this.taskCounter
		const taskConfig = { ...DEFAULT_TASK_CONFIG, ...config }

		const taskInfo = {
			id: taskId,
			fn: taskFn,
			status: TaskStatus.PENDING,
			priority: taskConfig.priority,
			timeout: taskConfig.timeout,
			timeoutId: null,
			startTime: null,
			endTime: null,
			error: null,
			result: null,
		}

		this.tasks.set(taskId, taskInfo)
		this.scheduleProcessing()

		// 返回任务ID和取消函数
		return {
			taskId,
			cancel: () => this.cancelTask(taskId),
		}
	}

	// 取消任务
	cancelTask(taskId) {
		const taskInfo = this.tasks.get(taskId)
		if (!taskInfo || taskInfo.status === TaskStatus.COMPLETED) {
			return false
		}

		if (taskInfo.timeoutId) {
			clearTimeout(taskInfo.timeoutId)
		}

		taskInfo.status = TaskStatus.CANCELLED
		this.emitTaskEvent(taskId, 'cancelled')
		return true
	}

	// 处理任务队列
	processTasks(deadline) {
		while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && this.hasProcessableTasks()) {
			const task = this.getNextTask()
			if (!task) break

			this.executeTask(task)
		}

		if (this.hasProcessableTasks()) {
			this.scheduleProcessing()
		} else {
			this.ongoing = false
		}
	}

	// 执行单个任务
	async executeTask(taskInfo) {
		taskInfo.status = TaskStatus.RUNNING
		taskInfo.startTime = performance.now()
		this.emitTaskEvent(taskInfo.id, 'start')

		// 设置超时
		taskInfo.timeoutId = setTimeout(() => {
			if (taskInfo.status === TaskStatus.RUNNING) {
				this.handleTaskTimeout(taskInfo)
			}
		}, taskInfo.timeout)

		try {
			taskInfo.result = await taskInfo.fn()
			if (taskInfo.status !== TaskStatus.CANCELLED) {
				this.handleTaskSuccess(taskInfo)
			}
		} catch (error) {
			if (taskInfo.status !== TaskStatus.CANCELLED) {
				this.handleTaskError(taskInfo, error)
			}
		}
	}

	// 处理任务成功
	handleTaskSuccess(taskInfo) {
		clearTimeout(taskInfo.timeoutId)
		taskInfo.status = TaskStatus.COMPLETED
		taskInfo.endTime = performance.now()
		this.emitTaskEvent(taskInfo.id, 'complete', {
			result: taskInfo.result,
			duration: taskInfo.endTime - taskInfo.startTime,
		})
	}

	// 处理任务错误
	handleTaskError(taskInfo, error) {
		clearTimeout(taskInfo.timeoutId)
		taskInfo.error = error
		taskInfo.status = TaskStatus.FAILED
		taskInfo.endTime = performance.now()
		this.emitTaskEvent(taskInfo.id, 'error', {
			error,
			duration: taskInfo.endTime - taskInfo.startTime,
		})
	}

	// 处理任务超时
	handleTaskTimeout(taskInfo) {
		taskInfo.status = TaskStatus.TIMEOUT
		taskInfo.endTime = performance.now()
		this.emitTaskEvent(taskInfo.id, 'timeout', {
			duration: taskInfo.endTime - taskInfo.startTime,
		})
	}

	// 调度处理
	scheduleProcessing() {
		if (this.ongoing) return
		this.ongoing = true
		this.requestIdle(this.processTasks.bind(this))
	}

	// 获取下一个要执行的任务
	getNextTask() {
		return Array.from(this.tasks.values())
			.filter((task) => task.status === TaskStatus.PENDING)
			.sort((a, b) => b.priority - a.priority)[0]
	}

	// 检查是否有可处理的任务
	hasProcessableTasks() {
		return Array.from(this.tasks.values()).some((task) => task.status === TaskStatus.PENDING)
	}

	// 事件监听相关方法
	addEventListener(taskId, event, callback) {
		const key = `${taskId}:${event}`
		if (!this.listeners.has(key)) {
			this.listeners.set(key, new Set())
		}
		this.listeners.get(key).add(callback)

		return () => this.removeEventListener(taskId, event, callback)
	}

	removeEventListener(taskId, event, callback) {
		const key = `${taskId}:${event}`
		const callbacks = this.listeners.get(key)
		if (callbacks) {
			callbacks.delete(callback)
		}
	}

	emitTaskEvent(taskId, event, data = {}) {
		const key = `${taskId}:${event}`
		const callbacks = this.listeners.get(key)
		if (callbacks) {
			callbacks.forEach((callback) => callback({ taskId, event, ...data }))
		}
	}

	// 获取任务状态
	getTaskStatus(taskId) {
		const task = this.tasks.get(taskId)
		if (!task) return null

		return {
			id: task.id,
			status: task.status,
			priority: task.priority,
			startTime: task.startTime,
			endTime: task.endTime,
			error: task.error,
			result: task.result,
		}
	}

	// 获取所有任务状态
	getAllTasksStatus() {
		return Array.from(this.tasks.values()).map((task) => this.getTaskStatus(task.id))
	}

	// 清空任务队列
	clear() {
		for (const [taskId, task] of this.tasks.entries()) {
			if (task.status === TaskStatus.RUNNING || task.status === TaskStatus.PENDING) {
				this.cancelTask(taskId)
			}
		}
		this.tasks.clear()
		this.listeners.clear()
	}
}

export default IdleTaskScheduler
