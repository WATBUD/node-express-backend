```javascript
// 抽象产品
class Animal {
  speak() {
    throw new Error('Method speak() must be implemented');
  }
}

// 具体产品
class Dog extends Animal {
  speak() {
    return 'Woof!';
  }
}

// 具体产品
class Cat extends Animal {
  speak() {
    return 'Meow!';
  }
}

// 工厂
class AnimalFactory {
  createAnimal(type) {
    switch (type) {
      case 'dog':
        return new Dog();
      case 'cat':
        return new Cat();
      default:
        throw new Error('Invalid animal type');
    }
  }
}

// 客户端代码
const factory = new AnimalFactory();

const dog = factory.createAnimal('dog');
console.log(dog.speak()); // 输出：Woof!

const cat = factory.createAnimal('cat');
console.log(cat.speak()); // 输出：Meow!
