```javascript
// 创建事件总线
class EventBus {
  constructor() {
    this.subscribers = {};
  }

  // 订阅事件
  subscribe(eventType, callback) {
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = [];
    }
    this.subscribers[eventType].push(callback);
  }

  // 发布事件
  publish(eventType, data) {
    if (this.subscribers[eventType]) {
      this.subscribers[eventType].forEach(callback => callback(data));
    }
  }
}

// 创建一个事件总线实例
const eventBus = new EventBus();

// 模块 A
class ModuleA {
  constructor() {
    // 订阅事件
    eventBus.subscribe('eventA', this.handleEvent.bind(this));
  }

  // 事件处理程序
  handleEvent(data) {
    console.log('Module A received data:', data);
  }
}

// 模块 B
class ModuleB {
  constructor() {
    // 订阅事件
    eventBus.subscribe('eventB', this.handleEvent.bind(this));
  }

  // 事件处理程序
  handleEvent(data) {
    console.log('Module B received data:', data);
  }
}

// 在模块 A 中触发事件
eventBus.publish('eventA', { message: 'Hello from Module A' });

// 在模块 B 中触发事件
eventBus.publish('eventB', { message: 'Hello from Module B' });
