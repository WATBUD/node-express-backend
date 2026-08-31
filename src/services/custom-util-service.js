const TIMEOUT_DURATION = 5000; // 10 seconds

class UtilService {

}


export const timeoutPromise = (promise, timeout) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeout);
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

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function dateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，所以要加 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function getFirstDayOfMonth(month, year = new Date().getFullYear()) {
  const firstDay = new Date(year, month - 1, 1); // 建立新的日期物件，指定月份的第一天
  return firstDay.toISOString().slice(0, 7).replace(/-/g, '') + '01'; // 返回 ISO 格式的日期字符串
}
export function getLastThreeMonthsDates(year, month,times) {
  const dates = []; 
  for (let i = 0; i < times; i++) {
    const currentDate = new Date(year, month - 1 - i, 1); 
    const yearStr = currentDate.getFullYear();// 建立新的日期物件，設定為倒數三個月的第一天
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = "01";
    dates.push(`${yearStr}${monthStr}${dayStr}`); 
  }
  return dates;
}


export default UtilService;
