import { basics } from "../src/basics.js";

function round(num) {
  return Math.round(num * 100) / 100;
}

describe("generateSuffix", () => {
  test("throws when input is not a string", () => {
    expect(() => basics.generateSuffix(123)).toThrow(TypeError);
    expect(() => basics.generateSuffix(null)).toThrow(TypeError);
  });

  test("returns '-' and zero entropy when phrase already has upper, lower, and digit", () => {
    const res = basics.generateSuffix("aA0");
    expect(res).toHaveProperty("suffix", "-");
    expect(res).toHaveProperty("suffixEntropy", 0);
  });

  test("adds one uppercase when phrase missing uppercase", () => {
    const res = basics.generateSuffix("abc0");
    expect(res.suffix.startsWith("-")).toBe(true);
    // one added character after dash
    expect(res.suffix.length).toBe(2);
    const ch = res.suffix[1];
    expect(/[A-Z]/.test(ch)).toBe(true);
    const expected = round(Math.log2(26));
    expect(res.suffixEntropy).toBe(expected);
  });

  test("adds one lowercase when phrase missing lowercase", () => {
    const res = basics.generateSuffix("A0");
    expect(res.suffix.length).toBe(2);
    const ch = res.suffix[1];
    expect(/[a-z]/.test(ch)).toBe(true);
    const expected = round(Math.log2(26));
    expect(res.suffixEntropy).toBe(expected);
  });

  test("adds one digit when phrase missing digit", () => {
    const res = basics.generateSuffix("aA");
    expect(res.suffix.length).toBe(2);
    const ch = res.suffix[1];
    expect(/[0-9]/.test(ch)).toBe(true);
    const expected = round(Math.log2(10));
    expect(res.suffixEntropy).toBe(expected);
  });

  test("adds all three classes when phrase empty", () => {
    const res = basics.generateSuffix("");
    // dash + 3 chars
    expect(res.suffix.length).toBe(4);
    const chars = res.suffix.slice(1).split("");

    // ensure at least one of each class appears among the added chars
    expect(chars.some((c) => /[A-Z]/.test(c))).toBe(true);
    expect(chars.some((c) => /[a-z]/.test(c))).toBe(true);
    expect(chars.some((c) => /[0-9]/.test(c))).toBe(true);

    const expected = round(Math.log2(26 * 26 * 10));
    expect(res.suffixEntropy).toBe(expected);
  });
});
