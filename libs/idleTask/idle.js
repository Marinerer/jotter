/**
 请使用`JavaScript`实现一个空闲时间执行任务的调度器，任务支持优先级、超时、延时和取消功能。要求如下：
1. 任务优先级（高、中、低）
2. 任务超时（超过指定时间未执行则取消）
3. 任务延时（延迟结束后任务进入调度队列）
4. 任务取消（随时取消任务）
5. 任务队列管理（任务按照优先级自动调度）

可能的边界情况：
- 任务在即将执行的时候被取消。
- 超时时间和任务执行时间刚好同时发生。
- 多个任务同时加入队列，按正确顺序执行。
- 使用requestAnimationFrame降级处理requestIdleCallback不支持的情况。

请实现这个调度器，并给出示例代码。
 */

// 任务优先级枚举
const PRIORITY = {
	low: 1,
	normal: 2,
	high: 3,
}
// 任务状态枚举
const TASK_STATUS = {
	PENDING: 'pending',
	RUNNING: 'running',
	COMPLETED: 'completed',
	FAILED: 'failed',
	CANCELLED: 'cancelled',
	TIMEOUT: 'timeout',
}

class Task {
	/**
	 * 创建任务
	 * @param {function} fn 任务函数
	 * @param {object} options 任务选项
	 * @param {string|number} options.id 任务id
	 * @param {'high'|'normal'|'low'} options.priority 任务优先级，默认为 `normal`
	 * @param {number} options.timeout 超时时间，单位ms (超时未执行则取消)
	 * @param {number} options.delay 延时时间，单位ms (延迟结束后任务进入调度队列)
	 */
	constructor(fn, options = {}) {
		this.id = options.id
		this.fn = fn
		this.priority = PRIORITY[options.priority] || PRIORITY.normal
		this.status = TASK_STATUS.PENDING
		this.delay = options.delay || 0
		this.timeout = options.timeout || 0
		this.createdAt = Date.now()
		this.delayId = null
		this.timeoutId = null
	}
}

class TaskEvent {
	constructor() {
		this._events = Object.create(null)
	}

	on(taskId, event, callback) {
		const type = `${taskId}:${event}`
		if (!this._events[type]) {
			this._events[type] = []
		}
		this._events[type].push(callback)
		return () => this.off(type, callback)
	}

	off(taskId, event, callback) {
		const type = `${taskId}:${event}`
		if (!this._events[type]) {
			return this
		}

		this._events[type] = this._events[type].filter((cb) => cb !== callback)
	}

	emit(taskId, event, data) {
		const type = `${taskId}:${event}`
		if (!this._events[type]) {
			return this
		}

		this._events[type].forEach((cb) => cb(data))
		delete this._events[type]
	}
}

class IdleTaskScheduler extends TaskEvent {
	constructor() {
		super()
		this._queue = []
		this._results = Object.create(null)
		this._id = 0

		// this.running = false; // 控制`启动/停止`调度器开关（调度器是否正在运行）
		this._processing = false // 是否正在处理任务，无任务时自动暂停调度器

		this._idleScheduler = this._getIdleScheduler()
	}

	_getIdleScheduler() {
		const requestIdle =
			((callback) => window.requestIdleCallback(callback)) ||
			((callback) =>
				window.requestAnimationFrame(() => {
					const start = performance.now()
					callback({
						didTimeout: false,
						timeRemaining: () => Math.max(0, 16.666 - (performance.now() - start)),
					})
				}))

		const cancelIdle = window.cancelIdleCallback || window.cancelAnimationFrame

		return {
			requestIdle,
			cancelIdle,
		}
	}

	addTask(fn, options = {}) {
		if (typeof fn !== 'function') {
			throw new Error('First argument must be a function')
		}

		if (typeof options === 'string') {
			options = { priority: options }
		}

		const task = new Task(fn, options)

		if (task.timeout > 0 && task.delay > 0 && task.timeout >= task.delay) {
			throw new Error('delay must be less than timeout')
		}

		if (!task.id) {
			task.id = ++this._id
		}

		// 处理任务超时，超过设定的 timeout 还未执行则自动取消任务
		if (task.timeout > 0) {
			task.timeoutId = setTimeout(() => {
				if (task.status === TASK_STATUS.PENDING) {
					this.cancelTask(task.id, TASK_STATUS.TIMEOUT)
				}
			}, task.timeout)
		}

		// 处理任务延时，延时结束后任务进入调度队列
		if (task.delay > 0) {
			task.delayId = setTimeout(() => {
				this._enqueue(task)
			}, task.delay)
		} else {
			this._enqueue(task)
		}

		// 记录任务信息
		// this._results[task.id] = task;
		const { id, status, priority, delay, timeout, delayId, timeoutId } = task
		this._results[task.id] = {
			id,
			status,
			priority,
			delay,
			timeout,
			delayId,
			timeoutId,
		}

		return task.id
	}

	// 添加任务到队列
	_enqueue(task) {
		if (task.status !== TASK_STATUS.PENDING) return

		this._queue.push(task)
		this.emit(task.id, TASK_STATUS.PENDING)
		//按优先级排序(降序)
		this._queue.sort((a, b) => b.priority - a.priority)

		// 如果当前没有任务在处理，则立即执行
		if (!this._processing) {
			this._schedule()
		}
	}

	cancelTask(taskId, reason = TASK_STATUS.CANCELLED) {
		const taskInfo = this._results[taskId]

		if (!taskInfo) {
			console.warn(`Task ${taskId} does not exist`)
			return false
		}

		if (taskInfo.status !== TASK_STATUS.PENDING) {
			console.warn(`Task ${taskId} was already ${taskInfo.status}`)
			return false
		}

		// 清理定时器
		if (taskInfo.timeoutId) {
			clearTimeout(taskInfo.timeoutId)
			taskInfo.timeoutId = null
		}
		if (taskInfo.delayId) {
			clearTimeout(taskInfo.delayId)
			taskInfo.delayId = null
		}
		// 从队列中移除
		this._queue = this._queue.filter((t) => t.id !== taskId)
		// 更新任务状态
		taskInfo.status = reason

		// 触发任务取消事件
		this.emit(taskInfo.id, reason)

		return true
	}

	// 调度任务执行
	_schedule() {
		/* if (this.running) return;
	  this.running = true; */

		if (!this._queue.length) {
			this._processing = false
			return
		}
		this._processing = true

		const scheduleTask = (deadline) => {
			while (this._queue.length > 0 && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
				const task = this._queue.shift()
				const taskInfo = this._results[task.id]

				// 检查任务是否已被取消
				if (taskInfo.status === TASK_STATUS.CANCELLED) continue

				// 检查任务是否已超时
				if (task.timeout && Date.now() - task.createdAt > task.timeout) {
					taskInfo.status = TASK_STATUS.TIMEOUT
					continue
				}

				// 执行任务
				try {
					taskInfo.status = TASK_STATUS.RUNNING
					this.emit(taskInfo.id, TASK_STATUS.RUNNING)
					task.fn()
					taskInfo.status = TASK_STATUS.COMPLETED
					this.emit(taskInfo.id, TASK_STATUS.COMPLETED)
				} catch (err) {
					taskInfo.status = TASK_STATUS.FAILED
					console.error(`Task ${taskInfo.id} failed:`, err)
					this.emit(taskInfo.id, TASK_STATUS.FAILED, err)
				}

				// 清理任务
				if (taskInfo.timeoutId) {
					clearTimeout(taskInfo.timeoutId)
					taskInfo.timeoutId = null
				}
				if (taskInfo.delayId) {
					taskInfo.delayId = null
				}
			}

			// 如果队列还有任务，继续处理
			if (this._queue.length > 0) {
				this._schedule()
			} else {
				this._processing = false
			}
		}

		this._idleSchedulerId = this._idleScheduler.requestIdle(scheduleTask)
	}

	start() {
		//
	}

	stop() {
		//
	}

	clear() {
		if (this._queue.length > 0) {
			this._queue.forEach((task) => {
				this.cancelTask(task.id)
			})
		}
		this._idleScheduler.cancelIdle(this._idleSchedulerId) // 取消调度器
		this._events = Object.create(null) // 清空事件监听
	}

	getTaskSize() {
		return this._queue.length // 返回队列中的任务数量
	}

	// 获取任务状态
	getTaskStatus(taskId) {
		const result = this._results[taskId]
		return result ? result.status : null
	}
}
