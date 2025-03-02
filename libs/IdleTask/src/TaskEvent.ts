import { TaskId, TaskFn, TaskStatus } from './types'

type TaskEventKey = `${TaskId}:${TaskEventType}`
interface TaskEventsMap {
	[taskKey: TaskEventKey]: TaskFn[]
}
type TaskEventType = TaskStatus
type TaskEventFn = (...args: any[]) => any

export class TaskEvent {
	protected _events: TaskEventsMap = Object.create(null)

	on(taskId: TaskId, event: TaskEventType, callback: TaskEventFn) {
		if (!taskId || !event || !callback) {
			throw new Error('Invalid arguments')
		}
		if (typeof callback !== 'function') {
			throw new Error('Callback must be a function')
		}

		const type = `${taskId}:${event}` as TaskEventKey
		if (!this._events[type]) {
			this._events[type] = []
		}
		this._events[type].push(callback)
		return () => this.off(taskId, event, callback)
	}

	off(taskId: TaskId, event: TaskEventType, callback: TaskEventFn) {
		const type = `${taskId}:${event}` as TaskEventKey
		const listeners = this._events[type]
		if (listeners) {
			this._events[type] = listeners.filter((cb) => cb !== callback)
		}
		return this
	}

	emit(taskId: TaskId, event: TaskEventType, data?: any) {
		const type = `${taskId}:${event}` as TaskEventKey
		const listeners = this._events[type]
		if (listeners) {
			listeners.forEach((cb) => cb(data))
			delete this._events[type]
		}
		return this
	}
}
