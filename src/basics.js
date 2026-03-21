// Character-class constants
const VOWELS = "aeiou";
const CONSONANTS = "bcdfghjklmnpqrstvwxyz";
const LOWERS = "abcdefghijklmnopqrstuvwxyz";
const UPPERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SPECIALS = "!#$%&*+-=?^_~()[]{}|";
const B64_SPECIALS = "+/";
const ALL_CHARS = LOWERS + UPPERS + DIGITS + SPECIALS;

// Bits of entropy per character when brute-forcing the full charset
const ENTROPY_PER_CHAR = Math.log2(ALL_CHARS.length);

/** Convert a single byte to a two-digit uppercase hex string. */
function byteToHex(b) {
  return b.toString(16).padStart(2, "0").toUpperCase();
}

/** Round to two decimal places. */
function round(num) {
  return Math.round(num * 100) / 100;
}

/**
 * Collection of cryptographically secure helper utilities for random values,
 * passphrase construction, and encoding.
 *
 * @namespace basics
 *
 * @property {function(number): number} secureRandomInt
 *   Return a cryptographically secure random integer in the range [0, max).
 *   Uses rejection sampling to eliminate modulo bias. Throws if max <= 0.
 *
 * @property {function(Array): *} pickRandomWord
 *   Pick and return a random element from an array.
 *
 * @property {function(string): string} pickRandomChar
 *   Pick and return a random character from a string.
 *
 * @property {function(Array): Array} secureShuffle
 *   Return a new array containing a cryptographically secure Fisher–Yates
 *   shuffle of the provided array.
 *
 * @property {function(): {suffix: string, suffixEntropy: number}} fullSuffix
 *   Build an unconditional dash-prefixed suffix containing one randomly
 *   chosen character from each mandatory complexity class (digit, lowercase,
 *   uppercase), shuffled into a random order. The leading '-' satisfies the
 *   symbol-class requirement. Unlike generateSuffix, this always emits all
 *   three class characters regardless of the base phrase's content.
 *   Returns { suffix, suffixEntropy } where suffixEntropy =
 *   log₂(|DIGITS| × |LOWERS| × |UPPERS|).
 *
 * @property {function(): {suffix: string, suffixEntropy: number}} digitUpperSuffix
 *   Build a dash-prefixed suffix containing one random digit and one random
 *   uppercase letter, shuffled into a random order. The leading '-' satisfies
 *   the symbol-class requirement. Entropy accounts for both character selections
 *   and the two possible orderings: log₂(2 × |DIGITS| × |UPPERS|).
 *
 * @property {function(string): {suffix: string, suffixEntropy: number}} generateSuffix
 *   Build a dash-prefixed suffix that fills in any missing character classes
 *   (upper, lower, digit) so that a phrase satisfies common password-complexity
 *   rules. When all three classes are already present but the phrase contains
 *   no character from B64_SPECIALS ('+' or '/'), a lone '-' is appended to
 *   satisfy a symbol requirement. Throws if the input is not a string.
 *
 * @property {function(string[], number=, boolean=): {phrase: string, entropy: number}} randomWords
 *   Pick wordCount words at random from a word list and join them with '-'.
 *   When needSuffix is true, appends a digitUpperSuffix and its entropy is
 *   included in the returned value. Throws if words is not a non-empty array.
 *   Parameters: words, wordCount = 1, needSuffix = false.
 *
 * @property {function(number, number, boolean=): {phrase: string, entropy: number}} vcWords
 *   Generate wordCount pseudo-words of wordLength characters each, built from
 *   alternating vowels and consonants, and join them with '-'. When needSuffix
 *   is true, appends a digitUpperSuffix and its entropy is included.
 *   Parameters: wordLength, wordCount, needSuffix = false.
 *
 * @property {function(number=): {phrase: string, entropy: number}} randomPhrase
 *   Generate a random password of the given length (default 14), guaranteeing
 *   at least one character from each class (lower, upper, digit, special).
 *   Minimum length enforced is 4. Returns phrase and entropy estimate (rounded).
 *
 * @property {function(number=, boolean=): {bytes: Uint8Array, hex: string, base64: string, entropyHex: number, entropyB64: number}} randomBytes
 *   Generate cryptographically secure random bytes (default 10, max 100).
 *   Returns the raw bytes, an uppercase hex string, a Base64 string (no padding),
 *   and entropy estimates for each encoding (byteCount × 8 bits each). When
 *   wantSuffix is true, generateSuffix is applied to both encodings; the
 *   resulting suffix entropy is intentionally excluded from the returned values.
 *   Throws if byteCount exceeds 100.
 *   Parameters: byteCount = 10, wantSuffix = false.
 *
 * @property {function((string|*), (string|*)): number} indexOfAny
 *   Return the index of the first character in `phrase` that also appears in
 *   `chars`, or -1 if none match. Coerces non-strings via String(...); returns
 *   -1 for empty inputs.
 *
 * @property {function((string|*), (string|*)): boolean} hasAnyChars
 *   Return true if any character from `chars` occurs in `phrase` (uses
 *   indexOfAny).
 *
 * @property {function(Uint8Array): string} bytesToBase64
 *   Encode a Uint8Array to Base64 and strip any trailing '=' padding.
 *
 * @property {function(Uint8Array): string} uint8ToHexString
 *   Convert a Uint8Array to an uppercase hex string (two hex chars per byte).
 *
 * @note This module depends on the global `crypto.getRandomValues` and on the
 *   module-level constants VOWELS, CONSONANTS, UPPERS, LOWERS, DIGITS,
 *   SPECIALS, B64_SPECIALS, ALL_CHARS, and the helpers `round` and `byteToHex`.
 *   Entropy values are estimated using base-2 logarithms and rounded to two
 *   decimal places before being returned.
 */
export const basics = {
  /** Return a cryptographically secure random integer in [0, max). */
  secureRandomInt: (max) => {
    if (max <= 0) throw new Error("max must be > 0");
    const array = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / max) * max;
    while (true) {
      crypto.getRandomValues(array);
      if (array[0] < limit) {
        return array[0] % max;
      }
    }
  },

  /** Pick a random element from an array. */
  pickRandomWord: (list) => {
    return list[basics.secureRandomInt(list.length)];
  },

  /** Pick a random character from a string. */
  pickRandomChar: (s) => {
    return s[basics.secureRandomInt(s.length)];
  },

  /** Fisher-Yates shuffle (returns a new array). */
  secureShuffle: (array) => {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = basics.secureRandomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  /**
   * Build an unconditional dash-prefixed suffix containing one randomly
   * chosen character from each of the three mandatory complexity classes
   * (digit, lowercase, uppercase), shuffled into a random order.
   *
   * Unlike {@link generateSuffix}, which only fills in character classes
   * absent from the base phrase, this always produces a full three-character
   * suffix. The leading '-' satisfies the symbol-class requirement.
   *
   * @returns {{ suffix: string, suffixEntropy: number }}
   *   suffix        – '-' followed by three shuffled characters, e.g. "-a3B".
   *   suffixEntropy – Bits of entropy added: log₂(|DIGITS| × |LOWERS| × |UPPERS|).
   */
  fullSuffix: () => {
    const chars = basics.secureShuffle([
      basics.pickRandomChar(DIGITS),
      basics.pickRandomChar(LOWERS),
      basics.pickRandomChar(UPPERS),
    ]);
    const suffix = ["-", ...chars].join("");
    const suffixEntropy = round(
      Math.log2(DIGITS.length * LOWERS.length * UPPERS.length),
    );
    return { suffix, suffixEntropy };
  },
  /**
   * Build a dash-prefixed suffix containing one random digit and one random
   * uppercase letter, shuffled into a random order.
   *
   * The leading '-' satisfies a symbol-class requirement. Entropy accounts
   * for both the character selections and the two possible orderings:
   * log₂(2 × |DIGITS| × |UPPERS|).
   *
   * @returns {{ suffix: string, suffixEntropy: number }}
   *   suffix        – '-' followed by two shuffled characters, e.g. "-3B" or "-B3".
   *   suffixEntropy – Bits of entropy: log₂(2 × |DIGITS| × |UPPERS|).
   */
  digitUpperSuffix: () => {
    const chars = basics.secureShuffle([
      basics.pickRandomChar(DIGITS),
      basics.pickRandomChar(UPPERS),
    ]);
    const suffix = ["-", ...chars].join("");
    const suffixEntropy = round(Math.log2(2 * DIGITS.length * UPPERS.length));
    return { suffix, suffixEntropy };
  },

  /**
   * Build a dash-prefixed suffix that fills in any missing character
   * classes (upper, lower, digit) so the final phrase satisfies typical
   * password-complexity rules.
   *
   * For each absent class a single random character is drawn from the
   * corresponding pool (UPPERS, LOWERS, DIGITS), the characters are
   * shuffled, and the result is prefixed with '-'. When all three classes
   * are present but the phrase contains no character from B64_SPECIALS
   * ('+' or '/'), a lone '-' is appended to cover a symbol requirement.
   * If no suffix is needed, suffix is '' and suffixEntropy is 0.
   *
   * @param {string} phrase - The base phrase to inspect.
   * @returns {{ suffix: string, suffixEntropy: number }}
   *   suffix        – The suffix string to append (may be empty).
   *   suffixEntropy – Bits of entropy added by character selections (0 for
   *                   a lone '-' or an empty suffix).
   * @throws {TypeError} If phrase is not a string.
   */
  generateSuffix: (phrase) => {
    if (typeof phrase !== "string") {
      throw new TypeError("phrase must be a string");
    }

    // Character-class pools to check, in order
    const pools = [
      { re: /[A-Z]/, pool: UPPERS },
      { re: /[a-z]/, pool: LOWERS },
      { re: /[0-9]/, pool: DIGITS },
    ];

    // Efficient check whether any character from `needles` appears in `haystack`.
    const anyIn = (needles, haystack) => {
      if (!needles || !haystack) return false;
      const set = new Set(haystack);
      for (const ch of needles) if (set.has(ch)) return true;
      return false;
    };
    const hasSymbol = anyIn(B64_SPECIALS, phrase);
    const chars = [];
    let product = 1;
    for (const { re, pool } of pools) {
      if (!re.test(phrase)) {
        const ch = basics.pickRandomChar(pool);
        chars.push(ch);
        product *= pool.length;
      }
    }

    // Build suffix: if we added class chars, prefix with '-' and shuffle them.
    // If we added no chars but the phrase lacks any symbol, add a lone '-'.
    let suffix = "";
    let suffixEntropy = 0;
    if (chars.length > 0) {
      suffix = ["-", ...basics.secureShuffle(chars)].join("");
      suffixEntropy = round(Math.log2(product));
    } else if (!hasSymbol) {
      suffix = "-";
    }
    return { suffix, suffixEntropy };
  },

  /**
   * Pick wordCount words at random from a word list and join them with '-'.
   *
   * Entropy is log₂(words.length) per word. When needSuffix is true a
   * {@link digitUpperSuffix} (digit + uppercase letter, order shuffled) is
   * appended and its entropy is added to the total.
   *
   * @param {string[]} words      - Non-empty array of candidate words.
   * @param {number}  [wordCount=1]  - Number of words to select.
   * @param {boolean} [needSuffix=false] - Whether to append a complexity suffix.
   * @returns {{ phrase: string, entropy: number }}
   * @throws {Error} If words is not a non-empty array.
   */
  randomWords: (words, wordCount = 1, needSuffix = false) => {
    if (!Array.isArray(words) || words.length === 0) {
      throw new Error("randomWords: words must be array with length > 0");
    }
    wordCount = Math.max(1, Math.floor(Number(wordCount) || 1));
    needSuffix = Boolean(needSuffix);
    const wordlistSize = words.length;
    let entropy = wordCount * Math.log2(wordlistSize);
    const ranWords = Array.from({ length: wordCount }, () =>
      basics.pickRandomWord(words),
    );
    let phrase = ranWords.join("-");
    if (needSuffix) {
      const { suffix, suffixEntropy } = basics.digitUpperSuffix(phrase);
      phrase += suffix;
      entropy += suffixEntropy;
    }
    return { phrase, entropy: round(entropy) };
  },

  /**
   * Generate wordCount pseudo-words of wordLength characters each, built
   * from alternating vowels (even positions) and consonants (odd positions),
   * then join them with '-'.
   *
   * Entropy per word is:
   *   ceil(wordLength/2) × log₂(|VOWELS|) + floor(wordLength/2) × log₂(|CONSONANTS|)
   *
   * When needSuffix is true a {@link digitUpperSuffix} is appended and its
   * entropy is added to the total.
   *
   * @param {number}  wordLength          - Characters per word (clamped to ≥ 1).
   * @param {number}  wordCount           - Number of words to generate (clamped to ≥ 1).
   * @param {boolean} [needSuffix=false]  - Whether to append a complexity suffix.
   * @returns {{ phrase: string, entropy: number }}
   */
  vcWords: (wordLength, wordCount, needSuffix = false) => {
    wordLength = Math.max(1, Math.floor(Number(wordLength)) || 1);
    wordCount = Math.max(1, Math.floor(Number(wordCount)) || 1);
    needSuffix = Boolean(needSuffix);
    const vowelsLen = VOWELS.length;
    const consonantsLen = CONSONANTS.length;
    const numVowels = Math.ceil(wordLength / 2);
    const numConsonants = Math.floor(wordLength / 2);
    let entropy =
      wordCount *
      (numVowels * Math.log2(vowelsLen) +
        numConsonants * Math.log2(consonantsLen));
    const makeWord = () =>
      Array.from({ length: wordLength }, (_, i) =>
        i % 2 === 0
          ? basics.pickRandomChar(VOWELS)
          : basics.pickRandomChar(CONSONANTS),
      ).join("");
    const words = Array.from({ length: wordCount }, () => makeWord());
    let phrase = words.join("-");
    if (needSuffix) {
      const { suffix, suffixEntropy } = basics.digitUpperSuffix(phrase);
      phrase += suffix;
      entropy += suffixEntropy;
    }
    return { phrase, entropy: round(entropy) };
  },
  /**
   * Generate a random password of the given length, guaranteeing at
   * least one character from each class (lower, upper, digit, special).
   *
   * @param {number} [chars=14]
   * @returns {{ phrase: string, entropy: number }}
   */
  randomPhrase: (chars = 14) => {
    chars = Math.max(4, Math.floor(Number(chars) || 0));

    // Guarantee at least one from each class
    const out = [
      basics.pickRandomChar(LOWERS),
      basics.pickRandomChar(UPPERS),
      basics.pickRandomChar(DIGITS),
      basics.pickRandomChar(SPECIALS),
    ];

    // Fill the remainder from the full charset
    for (let i = out.length; i < chars; i++) {
      out.push(basics.pickRandomChar(ALL_CHARS));
    }
    const phrase = basics.secureShuffle(out).join("");

    // First 4 chars drawn from distinct pools; remainder from ALL_CHARS
    const entropy =
      Math.log2(
        LOWERS.length * UPPERS.length * DIGITS.length * SPECIALS.length,
      ) +
      (phrase.length - 4) * Math.log2(ALL_CHARS.length);
    return { phrase, entropy: round(entropy) };
  },
  /**
   * Generate cryptographically secure random bytes and return both hex and
   * Base64 encodings alongside their entropy estimates.
   *
   * Entropy for each encoding is byteCount × 8 bits (raw byte entropy).
   * When wantSuffix is true, {@link generateSuffix} is called on both
   * encodings to satisfy character-class requirements; the entropy added by
   * the suffix is intentionally excluded from the returned values because its
   * computation depends on the specific byte values and the contribution is
   * negligible.
   *
   * @param {number}  [byteCount=10]    - Number of random bytes (1–100).
   * @param {boolean} [wantSuffix=false] - Whether to append complexity suffixes.
   * @returns {{ bytes: Uint8Array, hex: string, base64: string, entropyHex: number, entropyB64: number }}
   *   bytes      – Raw random bytes.
   *   hex        – Uppercase hex encoding (with optional suffix).
   *   base64     – Base64 encoding without padding (with optional suffix).
   *   entropyHex – Entropy of the hex phrase in bits (byteCount × 8).
   *   entropyB64 – Entropy of the Base64 phrase in bits (byteCount × 8).
   * @throws {Error} If byteCount exceeds 100.
   */
  randomBytes: (byteCount = 10, wantSuffix = false) => {
    const MAX_BYTES = 100;
    const DEFAULT_BYTES = 10;

    // Coerce and normalize the requested byte count
    let nobytes = Math.floor(Number(byteCount));
    if (!Number.isFinite(nobytes) || nobytes <= 0) nobytes = DEFAULT_BYTES;
    nobytes = Math.max(1, nobytes);
    if (nobytes > MAX_BYTES) {
      throw new Error(
        `randomBytes(byteCount): byteCount = ${nobytes} must be <= ${MAX_BYTES}`,
      );
    }
    wantSuffix = Boolean(wantSuffix);
    const bytes = new Uint8Array(nobytes);
    crypto.getRandomValues(bytes);
    let hex = basics.uint8ToHexString(bytes);
    let base64 = basics.bytesToBase64(bytes);
    let entropyHex = nobytes * 8;
    let entropyB64 = nobytes * 8;
    if (wantSuffix) {
      const { suffix: s1, suffixEntropy: e1 } = basics.generateSuffix(hex);
      hex += s1;
      // entropyHex += e1;
      const { suffix: s2, suffixEntropy: e2 } = basics.generateSuffix(base64);
      base64 += s2;
      // entropyB64 += e2;
    }
    return {
      bytes,
      hex,
      base64,
      entropyHex,
      entropyB64,
    };
  },
  /**
   * Return the index of the first character in `phrase` that also
   * appears in `chars`, or -1 if none match.
   */
  indexOfAny: (phrase, chars) => {
    phrase = typeof phrase === "string" ? phrase : String(phrase || "");
    chars = typeof chars === "string" ? chars : String(chars || "");
    if (chars.length === 0 || phrase.length === 0) return -1;
    const set = new Set(chars);
    for (let i = 0; i < phrase.length; i++) {
      if (set.has(phrase[i])) return i;
    }
    return -1;
  },

  /** Return true if any character from `chars` occurs in `phrase`. */
  hasAnyChars: (phrase, chars) => {
    return basics.indexOfAny(phrase, chars) !== -1;
  },

  /** Encode a Uint8Array to Base64 (no trailing padding). */
  bytesToBase64: (bytes) => {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/=+$/, "");
  },

  /** Convert a Uint8Array to an uppercase hex string. */
  uint8ToHexString: (buf) => {
    return Array.from(buf, byteToHex).join("");
  },
};
