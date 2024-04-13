const TIMEOUT_DURATION = 5000; // 10 seconds

class UtilService {

}


export const timeoutPromise = (promise, timeout) => {
  return new Promise((resolve, reject) => {
    // 设置超时定时器
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeout);

    // 等待原始 Promise 的解决或拒绝
    promise.then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
};

export const fetchTimeout = (url, options, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), timeout);
    }),
  ]);
};

export default UtilService;
