const crypto = require('crypto');

/**
 * Encrypts cleartext using AES-128-CBC.
 * The working key is hashed using MD5 to create the 128-bit key.
 * The IV is a 16-byte buffer of nulls.
 * 
 * @param {string} plainText - The query string parameters (key1=val1&key2=val2)
 * @param {string} workingKey - The working key from CCAvenue
 * @returns {string} The encrypted ciphertext as a hex string
 */
function encrypt(plainText, workingKey) {
  if (!workingKey) {
    throw new Error('Working key is required for CCAvenue encryption');
  }
  const key = crypto.createHash('md5').update(workingKey).digest();
  const iv = Buffer.alloc(16, 0); // 16 bytes of nulls
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypts hex ciphertext using AES-128-CBC.
 * 
 * @param {string} cipherTextHex - Hex-encoded ciphertext
 * @param {string} workingKey - The working key from CCAvenue
 * @returns {string} The decrypted cleartext string
 */
function decrypt(cipherTextHex, workingKey) {
  if (!workingKey) {
    throw new Error('Working key is required for CCAvenue decryption');
  }
  const key = crypto.createHash('md5').update(workingKey).digest();
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decrypted = decipher.update(cipherTextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Decrypts a response payload and parses it into a key-value object.
 * 
 * @param {string} cipherTextHex - Hex-encoded response from CCAvenue
 * @param {string} workingKey - The working key from CCAvenue
 * @returns {Record<string, string>} A map of decrypted query parameters
 */
function decryptQueryToObj(cipherTextHex, workingKey) {
  const decrypted = decrypt(cipherTextHex, workingKey);
  const params = {};
  const pairs = decrypted.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      params[decodeURIComponent(pair)] = '';
    } else {
      const key = decodeURIComponent(pair.slice(0, eqIdx));
      const val = decodeURIComponent(pair.slice(eqIdx + 1));
      params[key] = val;
    }
  }
  return params;
}

module.exports = {
  encrypt,
  decrypt,
  decryptQueryToObj,
};
