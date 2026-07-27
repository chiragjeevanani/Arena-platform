const crypto = require('crypto');

/**
 * Bank Muscat SmartPay encryption.
 *
 * Modes (BANK_MUSCAT_CRYPTO):
 * - aes-128-cbc  → classic CCAvenue / SmartPay PHP kit (Crypto.php)
 * - aes-256-gcm  → "Non Seamless 256 Bit" Python/PHP kit (ccavutil)
 *
 * If you get Error 10002 with correct MID/access_code/working_key + whitelisted URL,
 * try switching mode — wrong algorithm looks like merchant auth failure.
 */

const NONCE_LEN = 16;
const TAG_LEN = 16;
const CBC_IV = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

function getCryptoMode() {
  const raw = String(process.env.BANK_MUSCAT_CRYPTO || 'aes-128-cbc').trim().toLowerCase();
  if (raw === 'aes-256-gcm' || raw === 'gcm' || raw === '256') return 'aes-256-gcm';
  return 'aes-128-cbc';
}

function assertWorkingKeyGcm(workingKey) {
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

/** Classic kit: key = MD5(workingKey) as 16 raw bytes, fixed IV, AES-128-CBC, hex output. */
function encryptCbc(plainText, workingKey) {
  if (!workingKey) throw new Error('Working key is required for SmartPay encryption');
  const key = crypto.createHash('md5').update(String(workingKey), 'utf8').digest();
  const cipher = crypto.createCipheriv('aes-128-cbc', key, CBC_IV);
  return Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]).toString('hex');
}

function decryptCbc(cipherTextHex, workingKey) {
  if (!workingKey) throw new Error('Working key is required for SmartPay encryption');
  const key = crypto.createHash('md5').update(String(workingKey), 'utf8').digest();
  const data = Buffer.from(String(cipherTextHex), 'hex');
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, CBC_IV);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

/** 256-bit kit: AES-256-GCM, output hex(nonce + ciphertext + tag). */
function encryptGcm(plainText, workingKey) {
  const key = assertWorkingKeyGcm(workingKey);
  const nonce = crypto.randomBytes(NONCE_LEN);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, ciphertext, tag]).toString('hex');
}

function decryptGcm(cipherTextHex, workingKey) {
  const key = assertWorkingKeyGcm(workingKey);
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

function encrypt(plainText, workingKey) {
  return getCryptoMode() === 'aes-256-gcm'
    ? encryptGcm(plainText, workingKey)
    : encryptCbc(plainText, workingKey);
}

function decrypt(cipherTextHex, workingKey) {
  return getCryptoMode() === 'aes-256-gcm'
    ? decryptGcm(cipherTextHex, workingKey)
    : decryptCbc(cipherTextHex, workingKey);
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
  getCryptoMode,
  encryptCbc,
  decryptCbc,
  encryptGcm,
  decryptGcm,
};
