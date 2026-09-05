/**
 * submit.ts
 *
 * Builds and submits the "lock" transaction: a sender deposits an
 * encrypted-message reference at the WhisperBox script address, committed
 * to a one-time secret only they (and whoever they share the secret with)
 * know. No sender-identifying data is embedded in the datum.
 *
 * Usage:
 *   npx ts-node src/submit.ts "<cid>" "<optional-secret-hex>"
 *
 * If no secret is provided, a fresh random 32-byte secret is generated.
 * PRINT AND SHARE THE SECRET OUT-OF-BAND — it is the only way to redeem
 * the entry, and it is intentionally never written on-chain in plaintext.
 */
import {
  Lucid,
  Blockfrost,
  Data,
  fromText,
  toHex,
  Constr,
} from "lucid-cardano";
import { randomBytes } from "crypto";
import { blake2b } from "@noble/hashes/blake2b";
import * as fs from "fs";

const NETWORK = "Preprod";

async function main() {
  const cid = process.argv[2];
  if (!cid) {
    console.error('Usage: ts-node src/submit.ts "<cid>" ["<secret-hex>"]');
    process.exit(1);
  }

  const secretHex = process.argv[3] ?? toHex(randomBytes(32));
  const secretBytes = Buffer.from(secretHex, "hex");
  const commitHash = toHex(blake2b(secretBytes, { dkLen: 32 }));

  const blockfrostKey = process.env.BLOCKFROST_PROJECT_ID;
  if (!blockfrostKey) {
    throw new Error("Set BLOCKFROST_PROJECT_ID in your environment (.env)");
  }

  const lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preprod.blockfrost.io/api/v0",
      blockfrostKey
    ),
    NETWORK
  );

  const seedPhrase = process.env.WALLET_SEED;
  if (!seedPhrase) {
    throw new Error("Set WALLET_SEED in your environment (.env)");
  }
  lucid.selectWalletFromSeed(seedPhrase);

  const scriptCbor = JSON.parse(
    fs.readFileSync("../contracts/plutus.json", "utf-8")
  ).validators[0].compiledCode;

  const validator = { type: "PlutusV3" as const, script: scriptCbor };
  const scriptAddress = lucid.utils.validatorToAddress(validator);

  const datum = Data.to(
    new Constr(0, [fromText(cid), commitHash])
  );

  const tx = await lucid
    .newTx()
    .payToContract(scriptAddress, { inline: datum }, { lovelace: 2_000_000n })
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();

  console.log("Submission locked.");
  console.log("Tx hash:", txHash);
  console.log("Share this secret with the box owner ONLY (not on-chain):");
  console.log("Secret (hex):", secretHex);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
