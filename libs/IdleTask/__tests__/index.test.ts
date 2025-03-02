//@ts-nocheck
import IdleTask from '../src/index'

// Mock performance API
global.performance = {
	now: jest.fn(() => Date.now()),
}

describe('IdleTask', () => {
	let idleTask

	beforeEach(() => {
		jest.useFakeTimers()
		idleTask = new IdleTask()
	})

	afterEach(() => {
		idleTask.clear()
		jest.clearAllTimers()
		jest.useRealTimers()
	})

	describe('Task Creation and Queue Management', () => {
		test('should create a task with default options', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn)

			expect(taskId).toBe(1)
			expect(idleTask.getTask(taskId).status).toBe('pending')
			expect(idleTask.getTaskSize()).toBe(1)
		})

		test('should create a task with options is string', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn, 'high')

			expect(taskId).toBe(1)
			expect(idleTask.getTask(taskId).status).toBe('pending')
			expect(idleTask.getTaskSize()).toBe(1)
		})

		test('should create a task with custom options', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn, {
				priority: 'high',
				delay: 1000,
				timeout: 500,
			})

			expect(idleTask.getTask(taskId).status).toBe('pending')
		})

		test('should throw error when fn is not a function', () => {
			expect(() => idleTask.addTask('not a function')).toThrow('First argument must be a function')
		})

		test('should throw error when timeout is greater than or equal to delay', () => {
			const fn = jest.fn()
			expect(() => idleTask.addTask(fn, { delay: 1000, timeout: 1000 })).toThrow(
				'Timeout must be less than delay'
			)
		})

		test('should sort tasks by priority', () => {
			const fn1 = jest.fn()
			const fn2 = jest.fn()
			const fn3 = jest.fn()

			idleTask.addTask(fn1, { priority: 'low' })
			idleTask.addTask(fn2, { priority: 'high' })
			idleTask.addTask(fn3, { priority: 'normal' })

			expect(idleTask.getTaskSize()).toBe(3)
			// Internal queue should be sorted by priority (high to low)
			expect(idleTask._queue[0].priority).toBe(3) // high
			expect(idleTask._queue[1].priority).toBe(2) // normal
			expect(idleTask._queue[2].priority).toBe(1) // low
		})
	})

	describe('Task Execution', () => {
		test('should execute task immediately when no delay', (done) => {
			const fn = jest.fn(() => 'result')
			const taskId = idleTask.addTask(fn)

			idleTask.on(taskId, 'completed', (result) => {
				expect(result).toBe('result')
				expect(fn).toHaveBeenCalled()
				done()
			})

			jest.runAllTimers()
		})

		test('should execute delayed task after delay', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn, { delay: 1000 })

			expect(idleTask.getTask(taskId).status).toBe('pending')

			jest.advanceTimersByTime(999)
			expect(idleTask.getTask(taskId).status).toBe('pending')

			jest.advanceTimersByTime(1)
			jest.runAllTimers()
			expect(fn).toHaveBeenCalled()
		})

		test('should handle task failure', (done) => {
			const error = new Error('Task failed')
			const fn = jest.fn(() => {
				throw error
			})
			const taskId = idleTask.addTask(fn)

			idleTask.on(taskId, 'failed', (err) => {
				expect(err).toBe(error)
				expect(idleTask.getTask(taskId).status).toBe('failed')
				done()
			})

			jest.runAllTimers()
		})

		test('should complete task when executed within timeout', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn, { timeout: 500 })

			// Run the task immediately
			jest.runAllTimers()

			expect(fn).toHaveBeenCalled()
			expect(idleTask.getTask(taskId).status).toBe('completed')
		})

		test('should timeout task if not executed within timeout period', () => {
			// Stop the scheduler to prevent immediate execution
			idleTask.stop()

			const fn = jest.fn()
			const taskId = idleTask.addTask(fn, { timeout: 500 })

			// Advance time past the timeout
			jest.advanceTimersByTime(501)
			expect(idleTask.getTask(taskId).status).toBe('timeout')
			expect(fn).not.toHaveBeenCalled()
		})
	})

	describe('Task Cancellation', () => {
		test('should cancel pending task', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn, { delay: 1000 })

			expect(idleTask.cancelTask(taskId)).toBe(true)
			expect(idleTask.getTask(taskId).status).toBe('cancelled')
			expect(idleTask.getTaskSize()).toBe(0)

			jest.runAllTimers()
			expect(fn).not.toHaveBeenCalled()
		})

		test('should not cancel completed task', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn)

			jest.runAllTimers()
			expect(idleTask.cancelTask(taskId)).toBe(false)
		})

		test('should clear timeout and delay timers on cancellation', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn, { delay: 1000, timeout: 500 })

			idleTask.cancelTask(taskId)
			jest.runAllTimers()

			expect(fn).not.toHaveBeenCalled()
			expect(idleTask._results[taskId].timeoutId).toBeNull()
			expect(idleTask._results[taskId].delayId).toBeNull()
		})
	})

	describe('Event Handling', () => {
		test('should emit events for task lifecycle', () => {
			const fn = jest.fn(() => 'result')
			const taskId = idleTask.addTask(fn, { delay: 100 }) //增加延时，不然pending事件被立即触发
			const events = []

			// 先绑定所有事件监听
			idleTask.on(taskId, 'pending', () => events.push('pending'))
			idleTask.on(taskId, 'running', () => events.push('running'))
			idleTask.on(taskId, 'completed', (result) => events.push('completed'))

			// 执行任务
			jest.runAllTimers()

			// 验证事件顺序和结果
			expect(events).toEqual(['pending', 'running', 'completed'])
			expect(fn).toHaveBeenCalled()
		})

		test('should handle event unsubscription', () => {
			const fn = jest.fn()
			const taskId = idleTask.addTask(fn)
			const callback = jest.fn()

			const unsubscribe = idleTask.on(taskId, 'completed', callback)
			unsubscribe()

			jest.runAllTimers()
			expect(callback).not.toHaveBeenCalled()
		})

		test('should throw error for invalid event subscription', () => {
			expect(() => idleTask.on(null, 'completed', () => {})).toThrow('Invalid arguments')
			expect(() => idleTask.on(1, 'completed', 'not a function')).toThrow(
				'Callback must be a function'
			)
		})
	})

	describe('Scheduler Control', () => {
		test('should stop and start scheduler', () => {
			const fn = jest.fn()
			idleTask.addTask(fn)

			idleTask.stop()
			jest.runAllTimers()
			expect(fn).not.toHaveBeenCalled()

			idleTask.start()
			jest.runAllTimers()
			expect(fn).toHaveBeenCalled()
		})

		test('should clear all tasks', () => {
			const fn1 = jest.fn()
			const fn2 = jest.fn()
			idleTask.addTask(fn1)
			idleTask.addTask(fn2)

			idleTask.clear()
			expect(idleTask.getTaskSize()).toBe(0)
			expect(idleTask._events).toEqual({})

			jest.runAllTimers()
			expect(fn1).not.toHaveBeenCalled()
			expect(fn2).not.toHaveBeenCalled()
		})
	})

	describe('Environment Detection', () => {
		test('should use requestIdleCallback in browser environment', () => {
			// 保存原始window对象
			const originalWindow = global.window

			// Mock window environment
			//! Jest 的浏览器环境目前不存在 requestIdleCallback API
			const mockRequestIdleCallback = jest.fn()
			const mockCancelIdleCallback = jest.fn()
			global.window.requestIdleCallback = mockRequestIdleCallback
			global.window.cancelIdleCallback = mockCancelIdleCallback

			const newIdleTask = new IdleTask()
			const fn = jest.fn()
			newIdleTask.addTask(fn)

			expect(mockRequestIdleCallback).toHaveBeenCalled()

			// 还原
			global.window = originalWindow
		})

		test('should use requestAnimationFrame fallback', () => {
			// 保存原始window对象
			const originalWindow = global.window
			delete global.window.requestIdleCallback //! 默认 Jest DOM环境不存在 requestIdleCallback

			const mockRequestAnimationFrame = jest.fn()
			const mockCancelAnimationFrame = jest.fn()
			global.window.requestAnimationFrame = mockRequestAnimationFrame
			global.window.cancelAnimationFrame = mockCancelAnimationFrame

			const newIdleTask = new IdleTask()
			const fn = jest.fn()
			newIdleTask.addTask(fn)

			expect(mockRequestAnimationFrame).toHaveBeenCalled()

			// 还原
			global.window = originalWindow
		})

		test('should use setTimeout fallback in non-browser environment', () => {
			// 保存原始window对象
			const originalWindow = global.window
			delete global.window

			const fn = jest.fn()
			const idleTask = new IdleTask()
			idleTask.addTask(fn)

			// 运行定时器
			jest.runAllTimers()
			expect(fn).toHaveBeenCalled()

			// 还原
			global.window = originalWindow
		})

		test('should calculate correct timeRemaining in timeoutPolyfill', () => {
			// 保存原始window对象
			const originalWindow = global.window
			delete global.window

			// Mock Date.now() 来控制时间
			let currentTime = 10
			const mockNow = jest.spyOn(Date, 'now').mockImplementation(() => currentTime)

			const idleTask = new IdleTask()
			idleTask._idleScheduler.requestIdle((deadline) => {
				// expect(deadline.timeRemaining()).toBeGreaterThanOrEqual(50)
				expect(deadline.timeRemaining()).toBe(20) // 50 - (Date.now() - start)
			})

			// 设置当前时间并运行定时器
			currentTime = 40
			jest.runAllTimers()

			// 清理&还原
			mockNow.mockRestore()
			global.window = originalWindow
		})

		test('should clear timeout in timeoutPolyfill', () => {
			// 保存并移除 window 对象
			const originalWindow = global.window
			delete global.window

			const idleTask = new IdleTask()
			// 使用 spy 监视 clearTimeout
			const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
			// 停止任务调度
			idleTask.stop()

			// 验证 clearTimeout 被调用
			expect(clearTimeoutSpy).toHaveBeenCalled()

			// 清理
			clearTimeoutSpy.mockRestore()
			global.window = originalWindow
		})
	})
})
