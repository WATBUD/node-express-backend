// 創建一個簡單的容器類別
import StockController from "./Controllers/StockController.js";
import SharedAPI_Controller from "./Controllers/SharedAPI_Controller.js";
import SharedService from "./core/application/SharedService.js";
import UserService from "./core/application/UserService.js";
import HttpClientService from "./core/application/HttpClientService.js";
import User_Controller from "./Controllers/User_Controller.js";
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
container.register(
  "SharedAPI_Controller",
  SharedAPI_Controller(
    container.resolve("SharedService"),
    container.resolve("HttpClientService")
  )
);
container.register("UserService", UserService);
container.register("User_Controller", User_Controller(container.resolve("UserService")));


//container.register("StockService", new StockService());
//container.register("UserService", new UserService());


//container.register("StockController", new StockController(container.resolve("StockService")));


export default container;
