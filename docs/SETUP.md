# Setup

## Prerequisites

- Node.js 20+
- [Aiken](https://aiken-lang.org/installation-guide) (`curl -sSfL https://install.aiken-lang.org | bash`)
- A [Blockfrost](https://blockfrost.io) Preprod project ID
- A Cardano wallet funded with **test ADA** on Preprod
  (use the [Preprod faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/))

## 1. Build the contract

```bash
cd contracts
aiken check
aiken build
```

This produces `contracts/plutus.json`, which the off-chain scripts read
to derive the script address.

## 2. Configure off-chain environment

```bash
cd offchain
npm install
cp .env.example .env
```

Edit `.env`:

```
BLOCKFROST_PROJECT_ID=preprodXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
WALLET_SEED="your twenty-four word test wallet seed phrase"
```

⚠️ Use a **dedicated test wallet only**. Never put a mainnet seed phrase
in a `.env` file.

## 3. Deploy / verify the script address

```bash
npm run submit -- "bafy_test_cid" 
```

The first run will print the derived script address and lock a small
test UTxO there — copy the script address into the README.

## 4. Run the frontend locally

```bash
cd frontend
python3 -m http.server 8080
```

Open `http://localhost:8080`, connect a Preprod-configured wallet
(Nami, Eternl, or Lace), and try locking a submission.

## 5. Run tests / CI locally

```bash
cd offchain
npm run lint
npm test
```

These are the same checks that run in `.github/workflows/ci.yml` on
every push.
