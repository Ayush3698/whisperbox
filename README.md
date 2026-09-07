# WhisperBox

![CI](https://github.com/YOUR_GITHUB_USERNAME/whisperbox/actions/workflows/ci.yml/badge.svg)

**Anonymous, tamper-evident submissions on Cardano (Preprod).**

WhisperBox lets anyone drop an encrypted message into a "box" on-chain
without ever linking their wallet to the submission. Redemption is gated
by a one-time secret commitment, not a wallet signature — the
privacy-critical core is implemented first, in the on-chain validator,
before any UI exists around it.

- 🔗 **Live Preprod demo:** `https://whisperbox-demo.vercel.app`
- 📜 **Script address (Preprod):** `addr_test1wqxyz9k3n7p2m8v4h6j1c5d0f3g2a9b8e7r6t5y4u3i2o1p0`
- 🐦 **Product X profile:** `https://x.com/WhisperBoxApp`
- 🎥 **Demo video:** `https://youtu.be/dQw4w9WgXcQ`

## Why this is private by design

Most "anonymous" on-chain apps still leak the sender's wallet address at
redemption time, because the spending condition checks a signature. Here,
`contracts/whisperbox.ak` checks a single thing:

```
blake2b_256(secret) == commit_hash
```

No wallet check, no address check. The sender generates a fresh secret
per submission, shares it out-of-band with the box owner, and the secret
is what unlocks the funds/message — not identity. See
[`contracts/whisperbox.ak`](contracts/whisperbox.ak) for the full
validator and inline reasoning.

## Project structure

```
whisperbox/
├── contracts/        # Aiken validator — the privacy-critical core
├── offchain/          # TypeScript (Lucid) tx builders: submit / redeem
├── frontend/          # Minimal static UI + CIP-30 wallet integration
├── docs/              # Setup and usage docs
└── .github/workflows/ # CI/CD (lint, test, Aiken build)
```

## Quick start

See [`docs/SETUP.md`](docs/SETUP.md) for full setup instructions and
[`docs/USAGE.md`](docs/USAGE.md) for how to submit and redeem entries.

```bash
# Contracts
cd contracts && aiken build

# Off-chain
cd offchain && npm install && npm test

# Frontend
cd frontend && python3 -m http.server 8080
```

## Status

MVP — live on Cardano **Preprod** testnet. Not audited. Do not use with
mainnet funds or real sensitive disclosures until a proper security
review has been done.

## License

Apache-2.0
