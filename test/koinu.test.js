const test = require("node:test");
const assert = require("node:assert/strict");

const { dogeToKoinu, koinuToDoge } = require("../dist/index.js");

test("dogeToKoinu converts valid positive amounts", () => {
  assert.equal(dogeToKoinu("1"), 100_000_000);
  assert.equal(dogeToKoinu("1.0"), 100_000_000);
  assert.equal(dogeToKoinu("1.00000000"), 100_000_000);
  assert.equal(dogeToKoinu("0.5"), 50_000_000);
  assert.equal(dogeToKoinu("0.00000001"), 1);
  assert.equal(dogeToKoinu("10"), 1_000_000_000);
  assert.equal(dogeToKoinu("100.123"), 10_012_300_000);
});

test("dogeToKoinu converts amounts with leading zeros", () => {
  assert.equal(dogeToKoinu("01"), 100_000_000);
  assert.equal(dogeToKoinu("001.5"), 150_000_000);
  assert.equal(dogeToKoinu("0000100"), 10_000_000_000);
});

test("dogeToKoinu converts zero amounts", () => {
  assert.equal(dogeToKoinu("0"), 0);
  assert.equal(dogeToKoinu("0.0"), 0);
  assert.equal(dogeToKoinu("0.00000000"), 0);
  assert.equal(dogeToKoinu("00000.00000000"), 0);
});

test("dogeToKoinu converts negative amounts", () => {
  assert.equal(dogeToKoinu("-1"), -100_000_000);
  assert.equal(dogeToKoinu("-0.5"), -50_000_000);
  assert.equal(dogeToKoinu("-10.123"), -1_012_300_000);
  assert.equal(dogeToKoinu("-0.00000001"), -1);
});

test("dogeToKoinu converts positive amounts with + sign", () => {
  assert.equal(dogeToKoinu("+1"), 100_000_000);
  assert.equal(dogeToKoinu("+0.5"), 50_000_000);
  assert.equal(dogeToKoinu("+10.123"), 1_012_300_000);
});

test("dogeToKoinu handles fractional precision correctly", () => {
  assert.equal(dogeToKoinu("1.1"), 110_000_000);
  assert.equal(dogeToKoinu("1.12"), 112_000_000);
  assert.equal(dogeToKoinu("1.123"), 112_300_000);
  assert.equal(dogeToKoinu("1.1234"), 112_340_000);
  assert.equal(dogeToKoinu("1.12345"), 112_345_000);
  assert.equal(dogeToKoinu("1.123456"), 112_345_600);
  assert.equal(dogeToKoinu("1.1234567"), 112_345_670);
  assert.equal(dogeToKoinu("1.12345678"), 112_345_678);
});

test("dogeToKoinu handles maximum safe values", () => {
  assert.equal(dogeToKoinu("90071992"), 9_007_199_200_000_000);
  assert.equal(dogeToKoinu("90071992.54740991"), 9_007_199_254_740_991);
});

test("dogeToKoinu throws on amounts too large", () => {
  assert.throws(
    () => dogeToKoinu("90071993"),
    /amount too large for a JS number/
  );
  assert.throws(
    () => dogeToKoinu("100000000"),
    /amount too large for a JS number/
  );
  assert.throws(
    () => dogeToKoinu("999999999"),
    /amount too large for a JS number/
  );
});

test("dogeToKoinu throws on invalid formats", () => {
  assert.throws(() => dogeToKoinu(""), /invalid amount/);
  assert.throws(() => dogeToKoinu("   "), /invalid amount/);
  assert.throws(() => dogeToKoinu("abc"), /invalid amount/);
  assert.throws(() => dogeToKoinu("1.2.3"), /invalid amount/);
  assert.throws(() => dogeToKoinu("1,234"), /invalid amount/);
  assert.throws(() => dogeToKoinu("1e5"), /invalid amount/);
});

test("dogeToKoinu throws on too many decimal places", () => {
  assert.throws(() => dogeToKoinu("1.123456789"), /invalid amount/);
  assert.throws(() => dogeToKoinu("0.000000001"), /invalid amount/);
});

test("koinuToDoge converts positive values", () => {
  assert.equal(koinuToDoge(100_000_000), "1.00000000");
  assert.equal(koinuToDoge(1), "0.00000001");
  assert.equal(koinuToDoge(50_000_000), "0.50000000");
  assert.equal(koinuToDoge(1_000_000_000), "10.00000000");
  assert.equal(koinuToDoge(10_012_300_000), "100.12300000");
});

test("koinuToDoge converts zero", () => {
  assert.equal(koinuToDoge(0), "0.00000000");
});

test("koinuToDoge converts negative values", () => {
  assert.equal(koinuToDoge(-100_000_000), "-1.00000000");
  assert.equal(koinuToDoge(-1), "-0.00000001");
  assert.equal(koinuToDoge(-50_000_000), "-0.50000000");
});

test("koinuToDoge converts large values", () => {
  assert.equal(koinuToDoge(9_007_199_200_000_000), "90071992.00000000");
  assert.equal(koinuToDoge(9_007_199_254_740_991), "90071992.54740991");
});

test("koinuToDoge always returns 8 decimal places", () => {
  assert.equal(koinuToDoge(112_300_000), "1.12300000");
  assert.equal(koinuToDoge(100_000_001), "1.00000001");
  assert.equal(koinuToDoge(123_456_789), "1.23456789");
});

test("dogeToKoinu and koinuToDoge are inverse operations", () => {
  const testValues = [
    "1",
    "0.5",
    "10.123",
    "0.00000001",
    "100.12345678",
    "-1",
    "-10.5",
  ];

  for (const value of testValues) {
    const koinu = dogeToKoinu(value);
    const doge = koinuToDoge(koinu);
    // Convert back to koinu to compare numbers instead of strings
    const roundTrip = dogeToKoinu(doge);
    assert.equal(
      roundTrip,
      koinu,
      `Round trip failed for ${value}: ${koinu} -> ${doge} -> ${roundTrip}`
    );
  }
});
