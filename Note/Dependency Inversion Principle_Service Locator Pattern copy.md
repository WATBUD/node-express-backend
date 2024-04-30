```javascript
class ServiceLocator {
  constructor() {
    this.services = {};
  }

  // 注册服务
  registerService(name, service) {
    this.services[name] = service;
  }

  // 获取服务
  getService(name) {
    if (!this.services[name]) {
      throw new Error(`Service ${name} not found`);
    }
    return this.services[name];
  }
}

// 创建一个服务定位器实例
const serviceLocator = new ServiceLocator();

// 服务实现类
class LoggerService {
  log(message) {
    console.log(`[Logger] ${message}`);
  }
}

// 注册服务
serviceLocator.registerService('logger', new LoggerService());

// 客户端类
class Client {
  constructor(serviceLocator) {
    this.logger = serviceLocator.getService('logger');
  }

  // 使用服务
  doSomething() {
    this.logger.log('Doing something...');
  }
}

// 创建客户端实例并注入服务定位器
const client = new Client(serviceLocator);
client.doSomething(); // 输出：[Logger] Doing something...
