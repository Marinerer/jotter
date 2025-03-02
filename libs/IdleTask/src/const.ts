// 任务优先级枚举
export const PRIORITY = {
	low: 1,
	normal: 2,
	high: 3,
} as const

// 任务状态枚举
export const TASK_STATUS = {
	PENDING: 'pending',
	RUNNING: 'running',
	COMPLETED: 'completed',
	FAILED: 'failed',
	CANCELLED: 'cancelled',
	TIMEOUT: 'timeout',
} as const
