const crypto = require('crypto');

/**
 * Official Bank Muscat SmartPay kit crypto
 * Source: "Non Seamless 256 Bit Python 3 Muscat" → ccavutil.py
 *
 * encrypt:
 *   AES.new(workingKey.encode(), AES.MODE_GCM)
 *   output hex(nonce + ciphertext + tag)
 *
 * decrypt:
 *   nonce = first 16 bytes, tag = last 16 bytes, middle = ciphertext
 *   AES-256-GCM decrypt_and_verify
 *
 * Working key must be 32 characters (32 UTF-8 bytes) for AES-256.
 */

const NONCE_LEN = 16;
const TAG_LEN = 16;

function assertWorkingKey(workingKey) {
  if (!workingKey) {
    throw new Error('Working key is required for SmartPay encryption');
  }
  const keyBuf = Buffer.from(String(workingKey), 'utf8');
  if (keyBuf.length !== 32) {
    throw new Error(
      `SmartPay 256-bit kit requires a 32-character working key (got ${keyBuf.length} bytes)`
    );
  }
  return keyBuf;
}

function encrypt(plainText, workingKey) {
  const key = assertWorkingKey(workingKey);
  const nonce = crypto.randomBytes(NONCE_LEN);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, ciphertext, tag]).toString('hex');
}

function decrypt(cipherTextHex, workingKey) {
  const key = assertWorkingKey(workingKey);
  const data = Buffer.from(String(cipherTextHex), 'hex');
  if (data.length < NONCE_LEN + TAG_LEN + 1) {
    throw new Error('Invalid SmartPay ciphertext');
  }
  const nonce = data.subarray(0, NONCE_LEN);
  const tag = data.subarray(data.length - TAG_LEN);
  const ciphertext = data.subarray(NONCE_LEN, data.length - TAG_LEN);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

function decryptQueryToObj(cipherTextHex, workingKey) {
  const decrypted = decrypt(cipherTextHex, workingKey);
  const params = {};
  for (const pair of decrypted.split('&')) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      params[pair] = '';
    } else {
      params[pair.slice(0, eqIdx)] = pair.slice(eqIdx + 1);
    }
  }
  return params;
}

module.exports = {
  encrypt,
  decrypt,
  decryptQueryToObj,
};
