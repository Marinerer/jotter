// 任务优先级定义
const TaskPriority = {
	HIGH: 0,
	NORMAL: 1,
	LOW: 2,
}

class IdleTaskScheduler {
	constructor() {
		this.tasks = new Map() // 优先级 -> 任务队列
		this.isProcessing = false
		this.taskIdCounter = 0

		// 初始化任务队列
		Object.values(TaskPriority).forEach((priority) => {
			this.tasks.set(priority, [])
		})

		// 绑定调度函数
		this.processTask = this.processTask.bind(this)

		// 根据环境选择合适的调度方法
		this.schedule = this.getScheduleMethod()
	}

	// 获取对应环境的调度方法
	getScheduleMethod() {
		if (typeof window !== 'undefined') {
			// 浏览器环境
			if ('requestIdleCallback' in window) {
				return (callback) => window.requestIdleCallback(callback, { timeout: 1000 })
			}
			// 降级方案：使用 requestAnimationFrame + setTimeout
			return (callback) => {
				return requestAnimationFrame(() => {
					setTimeout(callback, 0)
				})
			}
		} else {
			// Node.js 环境
			return (callback) => setImmediate(callback)
		}
	}

	// 添加任务
	addTask(task, priority = TaskPriority.NORMAL) {
		const taskId = this.taskIdCounter++
		this.tasks.get(priority).push({
			id: taskId,
			execute: task,
		})

		if (!this.isProcessing) {
			this.startProcessing()
		}

		return taskId
	}

	// 取消任务
	cancelTask(taskId) {
		this.tasks.forEach((queue) => {
			const index = queue.findIndex((task) => task.id === taskId)
			if (index !== -1) {
				queue.splice(index, 1)
			}
		})
	}

	// 开始处理任务
	startProcessing() {
		if (this.isProcessing) return
		this.isProcessing = true
		this.schedule(this.processTask)
	}

	// 处理任务
	processTask(deadline) {
		let timeRemaining
		if (deadline && typeof deadline.timeRemaining === 'function') {
			timeRemaining = () => deadline.timeRemaining()
		} else {
			timeRemaining = () => 1
		}

		// 按优先级遍历任务队列
		while (timeRemaining() > 0) {
			let executed = false

			for (const priority of Object.values(TaskPriority)) {
				const queue = this.tasks.get(priority)
				if (queue.length > 0) {
					const task = queue.shift()
					try {
						task.execute()
					} catch (error) {
						console.error('Task execution error:', error)
					}
					executed = true
					break
				}
			}

			if (!executed) {
				this.isProcessing = false
				return
			}
		}

		// 如果还有任务，继续调度
		if (this.hasPendingTasks()) {
			this.schedule(this.processTask)
		} else {
			this.isProcessing = false
		}
	}

	// 检查是否还有待处理的任务
	hasPendingTasks() {
		return Array.from(this.tasks.values()).some((queue) => queue.length > 0)
	}
}
