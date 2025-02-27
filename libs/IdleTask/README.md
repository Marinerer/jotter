# IdleTask

IdleTask is a task scheduler based on browser idle time, designed for managing and executing priority-based task queues. It efficiently handles background tasks without blocking the main thread.

## Features

- 🚀 Browser idle time-based task scheduling
- 🚥 Task priority support
- ⏰ Delayed task execution
- ⌛ Task timeout control
- 📊 Complete task state management
- 🎯 Event-driven task state monitoring
- 💪 Cross-platform compatibility (Browser & Node.js)

## Installation

```bash
npm install idle-task
```

## Basic Usage

```javascript
import IdleTask from 'idle-task'

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

## Task Priority

Three priority levels are supported:

```javascript
const taskId = scheduler.addTask(
	() => {
		// High priority task
	},
	{ priority: 'high' }
)
```

- `high`: High priority (3)
- `normal`: Normal priority (2, default)
- `low`: Low priority (1)

## Task Configuration Options

```javascript
const taskId = scheduler.addTask(
	() => {
		// Task logic
	},
	{
		priority: 'high', // Task priority
		delay: 1000, // Delay execution time (ms)
		timeout: 5000, // Task timeout (ms)
	}
)
```

## API Reference

### Core Methods

#### `addTask(fn, options)`

Add a new task to the queue.

- `fn`: Function - Task function to execute
- `options`: Object - Task configuration options
  - `priority`: 'low' | 'normal' | 'high' - Task priority
  - `delay`: Number - Delay execution time (milliseconds)
  - `timeout`: Number - Task timeout (milliseconds)
- Returns: Number - Task ID

#### `cancelTask(taskId, reason?)`

Cancel a specific task.

- `taskId`: Number - Task ID
- `reason`: String - Cancellation reason (optional)
- Returns: Boolean - Whether cancellation was successful

#### `on(taskId, event, callback)`

Listen to task state changes.

- `taskId`: Number - Task ID
- `event`: String - Event type
- `callback`: Function - Callback function
- Returns: Function - Unsubscribe function

### Task States

Available task states:

- `pending`: Waiting for execution
- `running`: Currently executing
- `completed`: Execution completed
- `failed`: Execution failed
- `cancelled`: Task cancelled
- `timeout`: Execution timeout

### Control Methods

#### `start()`

Start the task scheduler.

#### `stop()`

Stop the task scheduler.

#### `clear()`

Clear the task queue.

### Query Methods

#### `getTaskSize(status?)`

Get the number of tasks.

- `status`: String - Optional, count of tasks with specific status
- Returns: Number - Task count

#### `getTask(taskId)`

Get task information.

- `taskId`: Number - Task ID
- Returns: Object | null - Task information object

## Examples

### Basic Task Management

```javascript
const scheduler = new IdleTask()

// Add a high priority task with delay
const taskId = scheduler.addTask(() => console.log('High priority task executed!'), {
	priority: 'high',
	delay: 2000,
	timeout: 5000,
})

// Monitor task states
scheduler.on(taskId, 'pending', () => console.log('Task pending'))
scheduler.on(taskId, 'running', () => console.log('Task running'))
scheduler.on(taskId, 'completed', (result) => console.log('Task completed:', result))
scheduler.on(taskId, 'failed', (error) => console.error('Task failed:', error))
```

### Advanced Usage

```javascript
const scheduler = new IdleTask()

// Multiple tasks with different priorities
const highPriorityTask = scheduler.addTask(() => performHeavyCalculation(), { priority: 'high' })

const normalPriorityTask = scheduler.addTask(() => updateUIComponents(), {
	priority: 'normal',
	delay: 1000,
})

const lowPriorityTask = scheduler.addTask(() => cleanupCache(), { priority: 'low', timeout: 3000 })

// Task status monitoring
function monitorTaskProgress(taskId) {
	scheduler.on(taskId, 'running', () => {
		console.log(`Task ${taskId} started`)
	})

	scheduler.on(taskId, 'completed', (result) => {
		console.log(`Task ${taskId} completed:`, result)
	})

	scheduler.on(taskId, 'failed', (error) => {
		console.error(`Task ${taskId} failed:`, error)
	})
}

// Monitor all tasks
;[highPriorityTask, normalPriorityTask, lowPriorityTask].forEach(monitorTaskProgress)

// Get queue statistics
console.log('Pending tasks:', scheduler.getTaskSize('pending'))
console.log('Running tasks:', scheduler.getTaskSize('running'))
```

## Important Notes

1. Task timeout must be less than delay time (if delay is set)
2. Tasks cannot be paused once started
3. Completed or failed tasks cannot be re-executed
4. Tasks in queue won't execute when scheduler is stopped
5. All task operations are asynchronous and non-blocking

## Browser Compatibility

The scheduler uses a fallback strategy for task scheduling:

1. `requestIdleCallback` (preferred)
2. `requestAnimationFrame` (fallback)
3. `setTimeout` (final fallback)

## Best Practices

1. Use appropriate priority levels based on task urgency
2. Set reasonable timeout values to prevent task hanging
3. Always handle task failure cases
4. Clear the queue when no longer needed
5. Monitor task states for critical operations

## License

MIT
