# 微任務 (Microtasks)
Microtasks 上下文結束後立即執行的任務，通常>Macrotasks。
例子：
* Promise.then
* MutationObserver
* queueMicrotask

# 宏任務 (Macrotasks)
Macrotasks 一組較大的任務，等待主線程空閒後執行。
例子：
* setTimeout
* setInterval
* I/O 操作
* setImmediate（Node.js 特有）

工作流程（Event Loop）
每次事件循環都會：
清空微任務隊列（Microtasks Queue）。
執行下一個宏任務（Macrotasks Queue）。


``` javascript
console.log("begins");

setTimeout(() => {
  console.log("setTimeout 1");
  Promise.resolve().then(() => {
    console.log("promise 1");
  });
}, 0);

new Promise(function (resolve, reject) {
  console.log("promise 2");
  setTimeout(function () {
    console.log("setTimeout 2");
    resolve("resolve 1");
  }, 0);
}).then((res) => {
  console.log("dot then 1");
  setTimeout(() => {
    console.log(res);
  }, 0);
});
//OutPut:
begins
promise 2
setTimeout 1
promise 1
setTimeout 2
dot then 1
resolve 1
