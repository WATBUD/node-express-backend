```javascript
// 抽象组件
class Coffee {
  cost() {
    return 5; // 基础价格
  }
}

// 具体组件
class SimpleCoffee extends Coffee {
  cost() {
    return super.cost();
  }
}

// 装饰器基类
class CoffeeDecorator extends Coffee {
  constructor(coffee) {
    super();
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost();
  }
}

// 具体装饰器 - 加牛奶
class MilkDecorator extends CoffeeDecorator {
  constructor(coffee) {
    super(coffee);
  }

  cost() {
    return super.cost() + 2; // 牛奶价格
  }
}

// 具体装饰器 - 加糖
class SugarDecorator extends CoffeeDecorator {
  constructor(coffee) {
    super(coffee);
  }

  cost() {
    return super.cost() + 1; // 糖价格
  }
}

// 使用示例
const simpleCoffee = new SimpleCoffee();
console.log('Simple Coffee cost:', simpleCoffee.cost()); // 输出：Simple Coffee cost: 5

const coffeeWithMilk = new MilkDecorator(simpleCoffee);
console.log('Coffee with Milk cost:', coffeeWithMilk.cost()); // 输出：Coffee with Milk cost: 7

const coffeeWithSugar = new SugarDecorator(simpleCoffee);
console.log('Coffee with Sugar cost:', coffeeWithSugar.cost()); // 输出：Coffee with Sugar cost: 6

const coffeeWithMilkAndSugar = new SugarDecorator(new MilkDecorator(simpleCoffee));
console.log('Coffee with Milk and Sugar cost:', coffeeWithMilkAndSugar.cost()); // 输出：Coffee with Milk and Sugar cost: 8
