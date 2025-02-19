import { TaskFn, TaskId, TaskPriorityKey, TaskPriority, TaskStatus } from './types'
import { PRIORITY, TASK_STATUS } from './const'

export interface TaskOptions {
	/**
	 * 任务id
	 */
	id: TaskId

	/**
	 * 任务优先级
	 * @default 'normal'
	 */
	priority?: TaskPriorityKey

	/**
	 * 超时时间，单位ms (超时未执行则取消)
	 */
	timeout?: number

	/**
	 * 延时时间，单位ms (延迟结束后任务进入调度队列)
	 */
	delay?: number
}

export class Task {
	id: TaskId
	fn: TaskFn
	priority: TaskPriority
	status: TaskStatus
	delay: number
	timeout: number
	createdAt: number
	delayId: number | NodeJS.Timeout | null
	timeoutId: number | NodeJS.Timeout | null

	constructor(fn: TaskFn, options: TaskOptions = {} as TaskOptions) {
		this.id = options.id
		this.fn = fn
		this.priority = PRIORITY[options.priority!] || PRIORITY.normal
		this.status = TASK_STATUS.PENDING
		this.delay = options.delay || 0
		this.timeout = options.timeout || 0
		this.createdAt = Date.now()
		this.delayId = null
		this.timeoutId = null
	}
}
