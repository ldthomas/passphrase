import { basics } from "../src/basics.js";

describe("randomBytes", () => {
  beforeAll(() => {
    // Provide a Node-friendly `btoa` used by basics.bytesToBase64
    if (typeof global.btoa === "undefined") {
      global.btoa = (binary) =>
        Buffer.from(binary, "binary").toString("base64").replace(/=+$/, "");
    }
  });

  test("default returns 10 bytes with correct hex/base64/entropy", () => {
    const res = basics.randomBytes();
    expect(res).toHaveProperty("bytes");
    expect(res).toHaveProperty("hex");
    expect(res).toHaveProperty("base64");
    expect(res).toHaveProperty("entropyHex");
    expect(res).toHaveProperty("entropyB64");

    const bytes = res.bytes;
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(10);

    // hex should be uppercase, 2 chars per byte
    expect(res.hex).toMatch(/^[0-9A-F]+$/);
    expect(res.hex.length).toBe(bytes.length * 2);

    // base64 should match Node's Buffer output (without padding)
    const expectedB64 = Buffer.from(bytes)
      .toString("base64")
      .replace(/=+$/, "");
    expect(res.base64).toBe(expectedB64);

    // entropy is bytes * 8
    expect(res.entropyHex).toBe(bytes.length * 8);
    expect(res.entropyB64).toBe(bytes.length * 8);
  });

  test("respects requested byte count and enforces min 1", () => {
    const a = basics.randomBytes((byteCount = 1));
    expect(a.bytes.length).toBe(1);
    expect(a.hex.length).toBe(2);
    expect(a.entropyHex).toBe(8);

    const b = basics.randomBytes({ byteCount: 0 }); // should be coerced to 1
    expect(b.bytes.length).toBeGreaterThanOrEqual(1);

    const c = basics.randomBytes("not-a-number"); // defaults to 10
    expect(c.bytes.length).toBe(10);
  });

  test("hex value corresponds to bytes contents", () => {
    const res = basics.randomBytes(6);
    const bytes = res.bytes;
    const computed = Array.from(bytes, (b) =>
      b.toString(16).padStart(2, "0").toUpperCase(),
    ).join("");
    expect(res.hex).toBe(computed);
  });
});
