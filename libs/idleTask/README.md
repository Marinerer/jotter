请实现一个调度函数，在空闲时段执行任务，以避免阻塞主线程。要求如下：

1. 支持浏览器和Node.js环境。
2. 浏览器环境优先使用 requestIdleCallback API，并做兼容性处理。
3. 支持添加任务并指定优先级。

请完成代码实现，并提供示例说明。

请根据以下建议，合理的调整代码：

1. 是否可以自定义调度函数
2. 高/低优先级任务是否可以使用队列存储，比如unshift和push
3. 添加任务执行的统计信息

请根据以下建议调整代码：

1. 请移除 maxConcurrent 配置项功能
2. 请移除重试机制
3. requestIdleCallbackPolyfill 使用 requestAnimationFrame 代替更合理
