```javascript
- 「 var 」 與 「 let / const 」 

ES6 後，從 var 到 let / const
var 是函式作用域，let / const 是區塊作用域
var 與 let ，for 迴圈的綁定（bind）差異
var 的提升與 let / const 不同
var 允許重複宣告，let / const 會出錯


var 與 let / const ，主要有幾項差異：

作用域 (scope) 不同
for 迴圈的綁定 (bind) 差異
變量提升 (hoisting) 不同
重複宣告的差異


# /// 「var」 受函式限制，函式外變數存取失敗。///
function callCorgi() {
  var corgiDogName = '吐司';
}

console.log(corgiDogName);
//ReferenceError: corgiDogName is not defined

