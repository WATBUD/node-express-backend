
//在 JavaScript 中，类本身不能被定义为静态的
//class XXXXXXX {
const Calculator = {
    add: function(a, b) {
        return a + b;
    },
    subtract: function(a, b) {
        return a - b;
    }
};

// 使用示例
const sum = Calculator.add(5, 3);
const difference = Calculator.subtract(10, 7);

console.log(`Sum: ${sum}`);
console.log(`Difference: ${difference}`);
