import crypto from 'crypto';

// 使用 Node 內建 crypto.scrypt 做密碼雜湊，不需額外套件。
// 儲存格式為 "salt:hash"（hex），長度約 161 字元，符合 password_hash VarChar(256)。
const KEY_LENGTH = 64;

/**
 * 將明文密碼雜湊成 "salt:hash" 字串。
 * @param {string} plainPassword
 * @returns {Promise<string>}
 */
export const hashPassword = (plainPassword) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(plainPassword, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
};

/**
 * 驗證明文密碼是否與儲存的雜湊相符（timing-safe 比對）。
 * @param {string} plainPassword
 * @param {string} storedHash - 先前 hashPassword 產生的 "salt:hash"
 * @returns {Promise<boolean>}
 */
export const verifyPassword = (plainPassword, storedHash) => {
  return new Promise((resolve, reject) => {
    const [salt, key] = (storedHash || '').split(':');
    if (!salt || !key) return resolve(false);

    crypto.scrypt(plainPassword, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      const keyBuffer = Buffer.from(key, 'hex');
      if (keyBuffer.length !== derivedKey.length) return resolve(false);
      resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
    });
  });
};
