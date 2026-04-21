/**
 * @param {unknown} s
 * @returns {boolean}
 */
export function isMongoObjectId(s) {
  return typeof s === 'string' && /^[a-f0-9]{24}$/i.test(s);
}
