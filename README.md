# fractal-utils

Utilities for canonicalized payload signing using secp256k1.

## Install

This package is set up for local use. Install deps and build:

```bash
npm install
npm run build
```

## Usage

`signPayload` canonicalizes a JSON payload, hashes it with SHA-256, then signs
the digest and returns a compact (65-byte) signature encoded as base64.

```js
const { signPayload } = require("fractal-utils");

async function run() {
  const payload = { hello: "doge" };
  const privHex =
    "ce175df44bbac900456347f84e51455e10169088c0d89a7113ea875c8f9d604b";
  const pubHex =
    "03f8d43bd5956d1a6a3c9c96681cec6973d1ee4989e02589a815f0015c18736b7f";

  const signatureB64 = await signPayload(payload, privHex, pubHex);
  console.log(signatureB64);
}

run().catch(console.error);
```

## API

### `signPayload(payload, privHex, pubHex)`

- `payload`: any JSON-serializable value.
- `privHex`: hex-encoded secp256k1 private key.
- `pubHex`: hex-encoded secp256k1 public key; the prefix is used to determine
  whether the signature header marks the key as compressed.
- returns: base64 string of a 65-byte compact signature (`header || r || s`).

## Tests

```bash
npm test
```
