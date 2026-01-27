const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const canonicalize = require("canonicalize");
const secp = require("@noble/secp256k1");

const { signPayload } = require("../dist/index.js");

function canonicalHash(payload) {
  const json = JSON.stringify(payload);
  assert.notEqual(json, undefined, "JSON serialization failed");
  const parsed = JSON.parse(json);
  const canon = canonicalize(parsed);
  assert.notEqual(canon, undefined, "canonicalize failed");
  return createHash("sha256").update(canon).digest();
}

test("signPayload creates a valid compact signature", async () => {
  const privHex =
    "1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff001";
  const privKey = Buffer.from(privHex, "hex");
  const pubKey = secp.getPublicKey(privKey, true);
  const pubHex = Buffer.from(pubKey).toString("hex");

  const payload = { b: "two", a: 1, nested: { z: false, y: 3 } };
  const signatureB64 = await signPayload(payload, privHex, pubHex);

  const compact = Buffer.from(signatureB64, "base64");
  assert.equal(compact.length, 65, "compact signature must be 65 bytes");

  const header = compact[0];
  assert.ok(header >= 27 && header <= 34, "compact header out of range");

  const compressed = ((header - 27) & 4) !== 0;
  assert.equal(compressed, true, "signature should be marked compressed");

  const signature = compact.subarray(1);
  const digest = canonicalHash(payload);

  const verified = await secp.verify(signature, digest, pubKey);
  assert.equal(verified, true, "signature failed verification");
});

// test against values from the Go version of this signing code
test("signPayload matches known signature for hello=doge", async () => {
  const privHex =
    "ce175df44bbac900456347f84e51455e10169088c0d89a7113ea875c8f9d604b";
  const pubHex =
    "03f8d43bd5956d1a6a3c9c96681cec6973d1ee4989e02589a815f0015c18736b7f";
  const payload = { hello: "doge" };

  const signatureB64 = await signPayload(payload, privHex, pubHex);
  const expected =
    "HzVRPhAJhIjRE8XWCATag5EkqDL5hgeaw6CJ20fKQnZaBYl7BawibVWcuBj82/y/TwHQOIhg8/prNVQqJ4HSc5E=";

  assert.equal(signatureB64, expected, "signature mismatch");
});
