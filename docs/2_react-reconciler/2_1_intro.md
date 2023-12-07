## what is react reconciler

### 双缓存机制

### jsx - reactElement - Fiber - DOM

### mount以及update阶段

### 引入第一个工作循环

### 更新机制

考虑兼容多种不同的更新触发方式，方便扩展同步更新
`@rollup/plugin-replace`开发环境打印日志

beginWork中的性能优化，首次渲染时，先离屏渲染整颗子树，让后在HostRoot更新时一次性插入
