# IdleTask

[![version][npm-image]][npm-url]
[![CI status][github-action-image]][github-action-url]
[![codecov][codecov-image]][codecov-url]

[npm-url]: https://www.npmjs.com/package/@jotter/idle-task
[npm-image]: https://img.shields.io/npm/v/@jotter/idle-task?style=flat-square
[github-action-image]: https://img.shields.io/github/actions/workflow/status/Marinerer/jotter/release.yml?style=flat-square
[github-action-url]: https://github.com/Marinerer/jotter/actions/workflows/release.yml
[codecov-image]: https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW
[codecov-url]: https://codecov.io/gh/Marinerer/jotter

`IdleTask` is a task scheduler based on browser idle time, designed for managing and executing priority-based task queues. It efficiently handles background tasks without blocking the main thread.

> `IdleTask` 是一个基于浏览器空闲时间的任务调度器，用于管理和执行优先级任务队列。它能够在不阻塞主线程的情况下，高效地处理后台任务。

## Features

- 🚀 Browser idle time-based task scheduling
- 🚥 Task priority support
- ⏰ Delayed task execution
- ⌛ Cancel time-out tasks
- 📊 Complete task state management
- 🎯 Event-driven task state monitoring
- 💪 Cross-platform compatibility (Browser & Node.js)

## Installation

```bash
npm install @jotter/idle-task
```

## Usage

```javascript
import IdleTask from '@jotter/idle-task'

// Create a scheduler instance
const scheduler = new IdleTask()

// Add a task
const taskId = scheduler.addTask(() => {
	// Task execution logic
	console.log('Task executed!')
})

// Listen to task state changes
scheduler.on(taskId, 'completed', (result) => {
	console.log('Task completed:', result)
})
```

Three priority levels are supported:

```javascript
const taskId = scheduler.addTask(
	() => {
		// High priority task
	},
	{ priority: 'high' }
)
```

- `high`: High priority
- `normal`: Normal priority (default)
- `low`: Low priority

## API

### `addTask(fn, options)`

Add a new task to the queue.

- `fn`: `Function` - Task function to execute
- `options`: `Object` - Task configuration options
  - `priority`: `'low' | 'normal' | 'high'` - Task priority
  - `delay`: `Number` - Delay execution time (milliseconds)
  - `timeout`: `Number` - Task timeout (milliseconds)
- Returns: `Number` - Task ID

> [!TIP]
>
> `delay` : If the task is not executed within the time limit, it will be cancelled.
> `timeout` : Task insertion into scheduling queue after delay ends

### `cancelTask(taskId, reason?)`

Cancel a specific task.

- `taskId`: `Number` - Task ID
- `reason`: `String` - Cancellation reason (optional)
- Returns: `Boolean` - Whether cancellation was successful

### `on(taskId, event, callback)`

Listen to task state changes.

- `taskId`: `Number` - Task ID
- `event`: `String` - Event type
- `callback`: `Function` - Callback function
- Returns: `Function` - Unsubscribe function

### `start()`

Start the task scheduler.

### `stop()`

Stop the task scheduler.

### `clear()`

Clear the task queue.

### `getTaskSize(status?)`

Get the number of tasks.

- `status`: `String` - Optional, count of tasks with specific status
- Returns: Number - Task count

### `getTask(taskId)`

Get task information.

- `taskId`: Number - Task ID
- Returns: Object | null - Task information object

## Task States/Events

| name        | description           |
| ----------- | --------------------- |
| `pending`   | Waiting for execution |
| `running`   | Currently executing   |
| `completed` | Execution completed   |
| `failed`    | Execution failed      |
| `cancelled` | Task cancelled        |
| `timeout`   | Execution timeout     |

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/jotter/pulls).
