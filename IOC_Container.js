
import SharedService from "./core/application/shared_service.js";
import UserService from "./core/application/user_service.js";
import HttpClientService from "./core/application/HttpClientService.js";
//控制反轉(Inversion of Control，簡稱 IoC)，IoC強調的是將依賴管理的責任從應用程式內部移出,透過依賴注入來實現
class IOC_Container {
  constructor() {
    this.dependencies = {};
  }

  // 註冊依賴
  register(name, dependency) {
    this.dependencies[name] = dependency;
  }

  // 解析依賴
  resolve(name) {
    if (this.dependencies[name]) {
      return this.dependencies[name];
    } else {
      throw new Error(`Dependency '${name}' not found.`);
    }
  }
}

const container = new IOC_Container();
container.register("SharedService", SharedService);
container.register("HttpClientService", HttpClientService);
container.register("UserService", UserService);


//container.register("StockService", new StockService());
//container.register("UserService", new UserService());


//container.register("StockController", new StockController(container.resolve("StockService")));


export default container;
