import { basics } from "../src/basics.js";

function round(num) {
  return Math.round(num * 100) / 100;
}

describe("randomPhrase", () => {
  test("default produces 14 chars and includes all classes", () => {
    const res = basics.randomPhrase();
    expect(res).toHaveProperty("phrase");
    expect(res).toHaveProperty("entropy");

    const phrase = res.phrase;
    expect(phrase.length).toBe(14);

    // contains at least one lower, upper, digit, and special
    expect(/[a-z]/.test(phrase)).toBe(true);
    expect(/[A-Z]/.test(phrase)).toBe(true);
    expect(/[0-9]/.test(phrase)).toBe(true);
    expect(/[!#$%&*+\-=?^_~()\[\]{}|]/.test(phrase)).toBe(true);

    // entropy should match the formula used in the implementation
    const low = 26;
    const up = 26;
    const digits = 10;
    const specials = 20;
    const all = low + up + digits + specials; // 71

    const expected = round(
      Math.log2(low * up * digits * specials) +
        (phrase.length - 4) * Math.log2(all),
    );
    expect(res.entropy).toBe(expected);
  });

  test("enforces minimum length of 4 when given smaller input", () => {
    const res = basics.randomPhrase(2);
    expect(res.phrase.length).toBe(4);
    expect(res.entropy).toBeGreaterThan(0);
  });

  test("only contains allowed characters", () => {
    const res = basics.randomPhrase(20);
    expect(/^[A-Za-z0-9!#$%&*+\-=?^_~()\[\]{}|]+$/.test(res.phrase)).toBe(true);
  });
});
