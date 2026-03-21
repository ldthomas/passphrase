# Multi-Passphrase Generator

With one click generate **Count** passphrases for each of six different methods. Each passphrase will have a minimum entropy of **Entropy floor**. If the **Suffix** box is checked a short suffix will be added, if necessary, to complete the character classes, upper case, lower case, number and symbol. To copy any passphrase to the clipboard, mouse over and click the `copy` icon. Use the **Print** button (or `Ctrl+P`) to print the entire table. See the [Methods](#methods) and [Suffix](#suffix) notes for further details. For a general discussion of passphrase hygiene see one or more of these references<sup>[1](#references)</sup>.

_All passphrases are computed locally and never transmitted over the network._

[Documentation](#documentation)

## Controls

| Control           | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| **Entropy floor** | Minimum entropy (in bits) for each generated passphrase (default: 80)  |
| **Count**         | Number of passphrases to generate per method (1–20, default: 3)        |
| **Suffix**        | When checked, appends a suffix to satisfy character-class requirements |
| **Generate**      | Generates passphrases for all six methods                              |
| **Print**         | Prints the results table                                               |

## Entropy

Entropy here is _combinatorial entropy_, measured in bits: **H = log₂(N)**, where N is the total number of equally-likely outcomes. It represents the size of the search space an attacker must exhaust and is the standard measure for evaluating randomly generated passwords and passphrases.

Entropy is always calculated using the worst-case scenario. That is, the attacker knows the algorithms, the code and the word lists. Only the random selections are unknown. This leads to significantly lower entropy than if calculated using only character length. This implementation uses JavaScript's `crypto.getRandomValues()` for all random selections which provides a uniform randomness essentially indistinguishable from a truly random source.<sup>[2](#references)</sup>

How much entropy is enough? The general consensus is that to protect against offline attacks 80–100 bits are needed.<sup>[3](#references)</sup>

## Suffix

Many login systems require a passphrase to contain at least one character from each of four character classes: uppercase letter, lowercase letter, digit, and symbol. Checking the **Suffix** box appends a suffix when any class is missing. The suffix consists of a hyphen followed by one character drawn from each absent class, shuffled into a random order — for example, if the passphrase were `xyz` (lowercase only), the suffix might be `-1A` or `-A1`. The hyphen serves double duty as both a word separator and the required symbol character. (See each method below for its specific suffix rules.)

While the suffix does add a small amount of entropy to the passphrase, its purpose here is simply to complete a character-class requirement when necessary.

## Methods

### Vowel/Consonant Words

The idea of using passphrases instead of passwords to increase memorability dates back to the 1960s, and the idea of using pronounceable, nonsense syllables using alternating vowels and consonants dates back to at least 1970.<sup>[4](#references)</sup> This implementation uses pseudo-words constructed from alternating vowels and consonants. Five characters per word seems to be the sweet spot for the length vs pronounceability tradeoff. Word length (2–50) controls the length of each word.

### Diceware Words

While word-pool generators date to the 1960s, Arnold Reinhold's Diceware<sup>[5](#references)</sup> generator has today become the de facto standard. Since `crypto.getRandomValues()` and `/dev/urandom` have become reliable, software has been able to replace the dice. This implementation uses the Electronic Frontier Foundation (EFF) long wordlist<sup>[6](#references)</sup>. With 7,776 words it provides 12.9 bits of entropy per word.

### Short Words (3–6 chars)

Diceware passphrases need seven words to exceed 80 bits of entropy, resulting in passphrases of 47–65 characters or more. A curated list of shorter words achieves the same entropy while keeping passphrases noticeably more compact.

This list is drawn from [WordNet: A Lexical Database for English](https://wordnet.princeton.edu/), taking the top 6,000 entries from each of the adjective, adverb, noun, and verb lists. The combined pool was then filtered to words of three to six characters, and personally curated to remove ethnonyms, demonyms, and anything political, religious, expletive, or otherwise family-unfriendly. The resulting list contains 9,828 words, yielding **13.24 bits of entropy per word** — slightly more than Diceware's 12.92.

A seven-word passphrase from this list delivers **92.68 bits of entropy** versus Diceware's 90.47, while staying far shorter: typically only 27–48 characters compared to Diceware's 47–65.

### Random Phrase

This method draws characters uniformly at random from a pool of letters, digits, and symbols, while guaranteeing that the result contains at least one character from each class. The symbol set is restricted to `!#$%&*+-=?^_~()[]{}|` (20 characters), omitting those most likely to cause problems in shells, SQL, HTML, and connection strings.

The entropy formula is `log₂(10 × 26 × 26 × 20 × 82ⁿ⁻⁴)`, where `n` is the total number of characters. The four factors before the exponent reflect the guaranteed characters: one digit (10 choices), one uppercase letter (26), one lowercase letter (26), and one symbol (20). The remaining `n − 4` characters are drawn freely from the full 82-character pool (62 alphanumeric + 20 symbols), each contributing `log₂(82) ≈ 6.36` bits.

### Random Bytes

A byte encodes exactly 8 bits of entropy, so for an 80-bit floor only 10 bytes are needed. Because raw bytes must be rendered as printable ASCII to serve as a passphrase, two encodings are offered. Note that different classes of random bytes (`FF` and `00` for example) will result in different types of suffixes, seriously complicating the suffix entropy computation. While computationally possible, the entropy contribution of this suffix is small and considered negligible and therefore not included.

#### Random Bytes (base64)

This method encodes the same bytes using Base64. For a given entropy floor (without a suffix) it normally produces a passphrase of equal length to the Random Phrase method. Its advantage, if any, is that it is, arguably, easier on the eye and easier to type. Because Base64 draws from both letters, digits, and the `+` and `/` characters, the output frequently satisfies all four character-class requirements on its own, making a suffix unnecessary.

#### Random Bytes (hex)

This method encodes the bytes as uppercase hexadecimal. Since hex uses only digits (`0`–`9`) and uppercase letters (`A`–`F`), a suffix is nearly always needed to supply a lowercase letter; the leading hyphen covers the symbol class, yielding a suffix of the form `-a`.

## References

1. Passphrase hygiene:
   - [Canadian Centre for Cyber Security — Passphrases (ITSAP.30.32)](https://www.cyber.gc.ca/sites/default/files/cyber/publications/ITSAP.30.32%20-en.pdf)
   - [How-To Geek — How Good Password Hygiene Keeps You Safe](https://www.howtogeek.com/how-good-password-hygiene-keeps-you-safe/)
   - [Keeper Security — Password Hygiene Tips and Best Practices](https://www.keepersecurity.com/blog/2024/07/23/password-hygiene-tips-and-best-practices/)
2. `crypto.getRandomValues()`:
   - [W3C Web Crypto API — getRandomValues](https://www.w3.org/TR/WebCryptoAPI/#Crypto-method-getRandomValues)
   - [MDN — Crypto.getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
   - [NIST SP 800-90A Rev. 1](https://csrc.nist.gov/publications/detail/sp/800-90a/rev-1/final)
3. Entropy guidance:
   - [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)
   - The EFF Diceware list contains 7,776 words, providing approximately 12.9 bits of entropy per word. A six-word passphrase therefore contains about 77 bits of entropy; seven words contain about 90 bits. [Diceware FAQ](https://diceware.readme.io/docs/faqa)
4. A. F. T. Winograd, "On the Security of Passwords," MITRE Technical Report MTR‑2547, 1970
5. [Diceware Passphrase Home Page](https://theworld.com/~reinhold/diceware.html)
6. [EFF Large Wordlist](https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt)

## Documentation

Documentation is in the code in JSDoc format. Use:

```
npm run jsdoc
```

The documentation will be at `./docs/index.html`.
