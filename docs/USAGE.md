# Usage

## Submitting a message (sender)

1. Encrypt your message with a public key the box owner has shared, and
   upload the ciphertext to IPFS or Arweave. Get the resulting CID.
2. Lock it on-chain:

   ```bash
   cd offchain
   npm run submit -- "<your-cid>"
   ```

3. The script prints a **secret** (hex string) and a transaction hash.
   Share the secret with the box owner through a separate, private
   channel (in person, Signal, a printed QR code — anything other than
   the chain itself). This secret is the *only* way the entry can be
   redeemed, and it is never stored in plaintext on-chain.

## Redeeming a message (box owner)

1. Find the UTxO reference (`<tx-hash>#<index>`) for the submission —
   e.g. from a Cardano explorer pointed at the script address in the
   README, or from whatever notification channel you've set up.
2. Redeem it with the secret the sender gave you:

   ```bash
   cd offchain
   npm run redeem -- "<tx-hash>#<index>" "<secret-hex>"
   ```

3. Once redeemed, fetch the ciphertext from IPFS/Arweave using the CID
   stored in the datum, and decrypt it locally with your private key.

## Using the web UI

1. Open the frontend (see `docs/SETUP.md` step 4).
2. Connect a Preprod-configured CIP-30 wallet.
3. Paste in the CID of your already-uploaded encrypted payload and click
   **Lock submission on-chain**.
4. Note the secret shown after the transaction confirms, and share it
   with the box owner out-of-band.

## Threat model notes

- The chain reveals *that* a submission happened and *when*, but not
  *who* submitted it, as long as the sender doesn't reuse a wallet in a
  way that correlates with their identity elsewhere.
- The CID itself must point to properly encrypted content — WhisperBox
  does not encrypt for you.
- Secrets must be generated fresh per submission and never reused.
