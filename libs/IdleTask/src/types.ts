import { type TASK_STATUS, type PRIORITY } from './const'

export type TaskFn = (...args: any[]) => any
export type TaskId = string | number
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]
export type TaskPriorityKey = keyof typeof PRIORITY
export type TaskPriority = (typeof PRIORITY)[TaskPriorityKey]
export type TaskOptions =
	| TaskPriorityKey
	| {
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

			// 其他自定义属性，不支持自定义 Id
			[key: string]: any
	  }

export interface TaskResult {
	id: TaskId
	status: TaskStatus
	priority: TaskPriority
	delay: number
	timeout: number
	delayId: number | NodeJS.Timeout | null
	timeoutId: number | NodeJS.Timeout | null
}
