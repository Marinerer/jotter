import { TaskFn, TaskId, TaskStatus, TaskResult, TaskOptions as AddTaskOptions } from './types'
import { TASK_STATUS } from './const'
import { Task, type TaskOptions } from './Task'
import { TaskEvent } from './TaskEvent'

interface IdleDeadline {
	readonly didTimeout: boolean
	timeRemaining(): number
}
type IdleRequestCallback = (deadline: IdleDeadline) => void
interface IdleRequestScheduler {
	requestIdle: (callback: IdleRequestCallback) => number | NodeJS.Timeout
	cancelIdle: (handle: number) => void
}

class IdleTask extends TaskEvent {
	private _queue: Task[] = [] // 任务队列
	private _results: { [key: TaskId]: TaskResult } = Object.create(null) // 记录任务执行结果
	private _id: number = 0 // 任务id自增

	private _running: boolean = false // 控制`启动/停止`调度器开关（调度器是否正在运行）
	private _processing: boolean = false // 是否正在处理任务，无任务时自动暂停调度器

	private _idleScheduler: IdleRequestScheduler // 调度器
	private _idleSchedulerId: number | NodeJS.Timeout | null = null // 调度器id

	constructor() {
		super()

		// 初始化调度器
		this._idleScheduler = this._getIdleScheduler()

		// 启动调度器
		this.start()
	}

	/**
	 * 获取调度器
	 */
	_getIdleScheduler() {
		const timeoutPolyfill = () => ({
			requestIdle: (callback: IdleRequestCallback) => {
				const start = performance.now()
				return setTimeout(() =>
					callback({
						didTimeout: false,
						timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
					})
				)
			},
			cancelIdle: (id: number) => clearTimeout(id),
		})

		if (typeof window === 'undefined') {
			return timeoutPolyfill() // 非浏览器环境
		} else {
			if ('requestIdleCallback' in window) {
				return {
					requestIdle: window.requestIdleCallback.bind(window),
					cancelIdle: window.cancelIdleCallback.bind(window),
				}
			} else if ('requestAnimationFrame' in window) {
				return {
					requestIdle: (callback: IdleRequestCallback) => {
						const start = performance.now()
						return window.requestAnimationFrame(() => {
							callback({
								didTimeout: false,
								timeRemaining: () => Math.max(0, 16.666 - (performance.now() - start)),
							})
						})
					},
					cancelIdle: (id: number) => window.cancelAnimationFrame(id),
				}
			} else {
				return timeoutPolyfill()
			}
		}
	}

	/**
	 * 新增任务
	 * @param fn 任务函数
	 * @param options 任务选项
	 * @returns
	 */
	addTask(fn: TaskFn, options: AddTaskOptions = {}) {
		if (typeof fn !== 'function') {
			throw new Error('First argument must be a function')
		}
		if (typeof options === 'string') {
			options = { priority: options }
		}
		if (options.timeout! > 0 && options.delay! > 0 && options.timeout! >= options.delay!) {
			throw new Error('Timeout must be less than delay')
		}
		if (!options.id) {
			options.id = ++this._id
		}

		const task = new Task(fn, options as TaskOptions)

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
		this._results[task.id] = {
			id: task.id,
			status: task.status,
			priority: task.priority,
			delay: task.delay,
			timeout: task.timeout,
			delayId: task.delayId,
			timeoutId: task.timeoutId,
		}

		return task.id
	}

	// 添加任务到队列
	_enqueue(task: Task) {
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

	/**
	 * 取消任务
	 * @param taskId 任务id
	 * @param reason 任务状态，默认为取消
	 * @returns
	 */
	cancelTask(taskId: TaskId, reason: TaskStatus = TASK_STATUS.CANCELLED) {
		const taskInfo = this._results[taskId]

		if (!taskInfo || taskInfo.status !== TASK_STATUS.PENDING) {
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
		return this._updateTaskStatus(taskId, reason)
	}

	// 调度任务执行
	_schedule() {
		// 调度开关
		if (!this._running) return

		// 队列为空时
		if (!this._queue.length) {
			this._processing = false
			return
		}
		this._processing = true

		const scheduleTask = (deadline: IdleDeadline) => {
			while (this._queue.length > 0 && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
				const task = this._queue.shift()!
				this._runTask(task)
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

	// 执行任务
	_runTask(task: Task) {
		const taskInfo = this._results[task.id]

		// 检查任务是否已被取消
		if (taskInfo.status === TASK_STATUS.CANCELLED) return

		// 检查任务是否已超时
		if (task.timeout && Date.now() - task.createdAt > task.timeout) {
			taskInfo.status = TASK_STATUS.TIMEOUT
			return
		}

		// 执行任务
		try {
			this._updateTaskStatus(taskInfo.id, TASK_STATUS.RUNNING) //执行状态
			const res = task.fn()
			this._updateTaskStatus(taskInfo.id, TASK_STATUS.COMPLETED, res) //完成状态
		} catch (err) {
			this._updateTaskStatus(taskInfo.id, TASK_STATUS.FAILED, err) //失败状态
			console.error(`Task ${taskInfo.id} failed:`, err)
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

	// 更新任务状态
	_updateTaskStatus(taskId: TaskId, status: TaskStatus, data?: any) {
		const taskInfo = this._results[taskId]
		if (taskInfo) {
			// 更新任务状态
			taskInfo.status = status
			// 触发任务状态变更事件
			this.emit(taskInfo.id, status, data)
			return true
		}
		return false
	}

	/**
	 * 启动任务调度器
	 */
	start() {
		if (this._running) return

		this._running = true
		this._schedule()
	}

	/**
	 * 停止任务调度器
	 */
	stop() {
		if (!this._running) return

		this._running = false
		this._idleScheduler.cancelIdle(this._idleSchedulerId as number) // 取消调度器
	}

	/**
	 * 清空任务队列
	 */
	clear() {
		if (this._queue.length > 0) {
			this._queue.forEach((task) => this.cancelTask(task.id))
		}
		this._idleScheduler.cancelIdle(this._idleSchedulerId as number) // 取消调度器
		this._events = Object.create(null) // 清空事件监听
	}

	/**
	 * 获取任务数量
	 */
	getTaskSize() {
		return this._queue.length // 返回队列中的任务数量
	}

	/**
	 * 获取任务状态
	 * @param taskId 任务id
	 * @returns 任务状态
	 */
	getTaskStatus(taskId: TaskId) {
		const result = this._results[taskId]
		return result ? result.status : null
	}
}

export default IdleTask
