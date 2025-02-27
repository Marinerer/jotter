# @jotter/idle-task

IdleTask 是一个基于浏览器空闲时间的任务调度器，用于管理和执行优先级任务队列。它能够在不阻塞主线程的情况下，高效地处理后台任务。

## Features

- 🚀 基于浏览器空闲时间进行任务调度
- 🚥 支持任务优先级设置
- ⏰ 支持任务延时执行
- ⌛ 支持任务超时控制
- 📊 完整的任务状态管理
- 🎯 事件驱动的任务状态监听
- 💪 跨平台兼容（支持浏览器和 Node.js 环境）

## Installation

```bash
npm install @jotter/idle-task
```

## Usage

```javascript
import IdleTask from '@jotter/idle-task'

// 创建任务调度器实例
const scheduler = new IdleTask()

// 添加任务
const taskId = scheduler.addTask(() => {
	// 任务执行逻辑
	console.log('Task executed!')
})

// 添加高优先级任务
const highPriorityTaskId = scheduler.addTask(() => {
	console.log('High priority task executed!')
}, 'high')

// 监听任务状态
scheduler.on(taskId, 'completed', (result) => {
	console.log('Task completed:', result)
})
```

## 任务优先级

支持三个优先级等级：

```javascript
const taskId = scheduler.addTask(
	() => {
		// 高优先级任务
	},
	{ priority: 'high' }
)
```

- `high`: 高优先级（3）
- `normal`: 普通优先级（2，默认）
- `low`: 低优先级（1）

## 任务配置选项

```javascript
const taskId = scheduler.addTask(
	() => {
		// 任务逻辑
	},
	{
		priority: 'high', // 任务优先级
		delay: 1000, // 延迟执行时间（毫秒）
		timeout: 5000, // 任务超时时间（毫秒）
	}
)
```

## API

```typescript
new IdleTask()
```

### Methods

实例方法

#### `addTask(fn, options)`

添加新任务到队列，并返回任务ID。

- `fn`: `Function` - 要执行的任务函数
- `options`: `Object` - 任务配置选项
  - `priority`: `'low' | 'normal' | 'high'` - 任务优先级
  - `delay`: `Number` - 延迟执行时间（毫秒）
  - `timeout`: `Number` - 任务超时时间（毫秒）

#### `cancelTask(taskId)`

取消指定任务。

- `taskId`: Number - 任务ID

#### `on(taskId, event, callback)`

监听任务状态变化。

- `taskId`: Number - 任务ID
- `event`: String - 事件类型
- `callback`: Function - 回调函数
- 返回: Function - 取消监听的函数

#### `start()`

启动任务调度器（默认启动任务）。

#### `stop()`

停止任务调度器。

#### `clear()`

清空任务队列。

#### `getTaskSize(status?)`

获取任务数量。

- `status`: String - 可选，指定状态的任务数量

#### `getTask(taskId)`

获取任务信息。

- `taskId`: Number - 任务ID

### 任务状态 & 事件

任务状态和包含以下几种：

- `pending`: 等待执行
- `running`: 正在执行
- `completed`: 执行完成
- `failed`: 执行失败
- `cancelled`: 已取消
- `timeout`: 执行超时

## 使用示例

```javascript
const scheduler = new IdleTask()

// 添加一个延迟执行的高优先级任务
const taskId = scheduler.addTask(() => console.log('High priority task executed!'), {
	priority: 'high',
	delay: 2000,
	timeout: 5000,
})

// 监听任务状态
scheduler.on(taskId, 'pending', () => console.log('Task pending'))
scheduler.on(taskId, 'running', () => console.log('Task running'))
scheduler.on(taskId, 'completed', (result) => console.log('Task completed:', result))
scheduler.on(taskId, 'failed', (error) => console.error('Task failed:', error))

// 获取任务信息
console.log(scheduler.getTask(taskId))

// 获取待执行任务数量
console.log(scheduler.getTaskSize('pending'))
```

## 注意事项

1. 任务超时时间必须小于延迟时间（如果设置了延迟）
2. 任务一旦开始执行就不能被暂停
3. 已完成或失败的任务不能重新执行
4. 调度器停止后，队列中的任务将不会继续执行，需要重新启动调度器

## 兼容性

- 优先使用 `requestIdleCallback`
- 降级使用 `requestAnimationFrame`
- 最后降级使用 `setTimeout`

## License

MIT
