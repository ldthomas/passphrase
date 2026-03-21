import { basics } from "../src/basics.js";

/**
 * Try calling `supplier(attempt)` repeatedly until the requested entropy
 * threshold is met or the maximum iterations is reached.
 *
 * @param {(attempt:number)=>object} supplier - function which accepts an
 *   attempt number and returns a result object containing an entropy value.
 * @param {number} thresh - required minimum entropy (integer >= 1)
 * @param {number} [maxIterations=100] - maximum attempts
 * @param {string} [key='entropy'] - property name on result to check
 * @returns {object} the first result object meeting the threshold
 * @throws {Error} when threshold not met after `maxIterations`
 */
function attemptThreshold(
  supplier,
  thresh,
  maxIterations = 100,
  key = "entropy",
) {
  thresh = Math.max(1, Math.floor(Number(thresh) || 1));
  for (let i = 1; i <= maxIterations; i++) {
    const result = supplier(i);
    const val = result && Number(result[key]);
    if (!Number.isNaN(val) && val >= thresh) return result;
  }
  throw new Error(
    `threshold ${thresh} not met after ${maxIterations} iterations`,
  );
}

/**
 * Generate `pairs` of random words until `entropy` >= `thresh`.
 *
 * @param {string[]} words - source words to pick from (must be non-empty)
 * @param {number} [thresh=80] - target entropy
 * @param {boolean} [needSuffix=true] - whether to include suffixes
 * @returns {object} result from `basics.randomWords` (includes `entropy`)
 */
export function randomWords(words, thresh = 80, needSuffix = true) {
  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("randomWords: words must be array with length > 0");
  }
  needSuffix = Boolean(needSuffix);
  return attemptThreshold(
    (pairs) => basics.randomWords(words, pairs, needSuffix),
    thresh,
    100,
    "entropy",
  );
}

/**
 * Generate random bytes until `entropyHex` >= `thresh`.
 *
 * @param {number} [thresh=80] - target entropy (measured in hex bits)
 * @param {boolean} [needSuffix=true] - whether to include suffixes
 * @returns {object} result from `basics.randomBytes` (includes `entropyHex`)
 */
export function randomBytes(thresh = 80, needSuffix = true) {
  needSuffix = Boolean(needSuffix);
  return attemptThreshold(
    (bytes) => basics.randomBytes(bytes, needSuffix),
    thresh,
    100,
    "entropyB64",
  );
}

/**
 * Generate vowel-consonant words until `entropy` >= `thresh`.
 *
 * @param {number} wordLength - target length for each generated word (>=1)
 * @param {number} [thresh=80] - target entropy
 * @param {boolean} [needSuffix=true] - whether to include suffixes
 * @returns {object} result from `basics.vcWords` (includes `entropy`)
 */
export function vcWords(wordLength, thresh = 80, needSuffix = true) {
  wordLength = Math.max(1, Math.floor(Number(wordLength) || 1));
  needSuffix = Boolean(needSuffix);
  return attemptThreshold(
    (pairs) => basics.vcWords(wordLength, pairs, needSuffix),
    thresh,
    100,
    "entropy",
  );
}

/**
 * Try increasing phrase lengths until `entropy` >= `thresh`.
 *
 * This function differs from the others: it grows the character length of the
 * phrase rather than the number of pairs/bytes.
 *
 * @param {number} [thresh=80] - target entropy
 * @returns {object} result from `basics.randomPhrase` (includes `entropy`)
 */
export function randomPhrase(thresh = 80) {
  const MIN_CHARS = 4;
  const MAX_CHARS = 100;
  thresh = Math.max(1, Math.floor(Number(thresh) || 1));
  for (let chars = MIN_CHARS; chars <= MAX_CHARS; chars++) {
    const result = basics.randomPhrase(chars);
    if (result && Number(result.entropy) >= thresh) return result;
  }
  throw new Error(
    `randomPhrase: threshold entropy ${thresh} not met with ${MAX_CHARS} characters`,
  );
}
