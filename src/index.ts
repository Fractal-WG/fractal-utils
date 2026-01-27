import canonicalize from "canonicalize";
import { createHash, createHmac } from "crypto";
import * as secp from "@noble/secp256k1";

if (!secp.etc.hmacSha256Sync) {
  secp.etc.hmacSha256Sync = (key, ...msgs) => {
    const h = createHmac("sha256", Buffer.from(key));
    for (const msg of msgs) {
      h.update(Buffer.from(msg));
    }
    return new Uint8Array(h.digest());
  };
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  if (clean.length === 0 || clean.length % 2 !== 0) {
    throw new Error("invalid hex string");
  }
  return Uint8Array.from(Buffer.from(clean, "hex"));
}

function canonicalHash(payload: unknown): Uint8Array {
  const json = JSON.stringify(payload);
  if (json === undefined) {
    throw new Error("failed to JSON serialize payload");
  }
  const parsed = JSON.parse(json) as unknown;
  const canon = canonicalize(parsed);
  if (canon === undefined) {
    throw new Error("failed to canonicalize payload");
  }
  return createHash("sha256").update(canon).digest();
}

export async function signPayload(
  payload: unknown,
  privHex: string,
  pubHex: string,
): Promise<string> {
  const digest = canonicalHash(payload);
  const privKey = hexToBytes(privHex);
  const compressed = /^0[23]/i.test(pubHex.trim());

  const sig = secp.sign(digest, privKey);
  if (typeof sig.recovery !== "number") {
    throw new Error("signature recovery id missing");
  }
  const recid = sig.recovery;

  const header = 27 + recid + (compressed ? 4 : 0);
  const compact = new Uint8Array(65);
  compact[0] = header;
  compact.set(sig.toCompactRawBytes(), 1);

  return Buffer.from(compact).toString("base64");
}
