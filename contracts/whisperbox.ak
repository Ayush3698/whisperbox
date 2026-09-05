// WhisperBox — anonymous submission validator
//
// Privacy-critical core of the product.
//
// Design goal: a sender can lock a message (e.g. IPFS CID of an encrypted
// report) into a UTxO at this script address WITHOUT revealing any link
// between their spending wallet and the submission itself beyond what is
// unavoidable on a public ledger. The recipient (the "box owner") can only
// unlock/read entries by proving knowledge of a secret unlock key —
// spending is gated by a hash commitment, not by a wallet signature, so the
// sender's identity is never required on-chain.
//
// Flow:
//   1. Off-chain: sender encrypts their message, uploads ciphertext to
//      IPFS/Arweave, gets a CID.
//   2. Sender locks a UTxO at this script address. Datum = { cid, commit_hash }
//      where commit_hash = blake2b_256(secret) is chosen by the sender and
//      shared with the box owner out-of-band (e.g. QR code, printed slip).
//   3. Box owner spends the UTxO by presenting `secret` as redeemer, proving
//      commit_hash matches, without ever having to sign as the sender.
//
// This keeps sender wallet metadata out of the redemption path entirely —
// the only on-chain link is the one-time secret, generated fresh per
// submission, never reused, never tied to a wallet.

use aiken/hash.{Blake2b_256, Hash, blake2b_256}
use aiken/transaction.{ScriptContext, Spend}
use aiken/transaction/credential.{VerificationKey}

pub type SubmissionDatum {
  // Content-addressed pointer to the encrypted payload (IPFS/Arweave CID),
  // stored as raw bytes so no plaintext ever touches the chain.
  cid: ByteArray,
  // blake2b_256 hash of a one-time secret chosen by the submitter.
  commit_hash: Hash<Blake2b_256, ByteArray>,
}

pub type UnlockRedeemer {
  secret: ByteArray,
}

validator {
  fn whisperbox(
    datum: SubmissionDatum,
    redeemer: UnlockRedeemer,
    _ctx: ScriptContext,
  ) -> Bool {
    // The ONLY check: does the presented secret hash to the committed
    // value? No wallet signature, no sender-linked condition, no PII.
    blake2b_256(redeemer.secret) == datum.commit_hash
  }
}
