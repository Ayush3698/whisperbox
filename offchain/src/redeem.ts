/**
 * redeem.ts
 *
 * Spends a WhisperBox UTxO by presenting the one-time secret as the
 * redeemer. The validator only checks blake2b_256(secret) == commit_hash,
 * so the box owner never needs to know or reference the sender's wallet.
 *
 * Usage:
 *   npx ts-node src/redeem.ts "<tx-hash>#<output-index>" "<secret-hex>"
 */
import { Lucid, Blockfrost, Data, Constr } from "lucid-cardano";
import * as fs from "fs";

const NETWORK = "Preprod";

async function main() {
  const utxoRef = process.argv[2];
  const secretHex = process.argv[3];
  if (!utxoRef || !secretHex) {
    console.error(
      'Usage: ts-node src/redeem.ts "<tx-hash>#<index>" "<secret-hex>"'
    );
    process.exit(1);
  }
  const [txHash, indexStr] = utxoRef.split("#");

  const blockfrostKey = process.env.BLOCKFROST_PROJECT_ID;
  const seedPhrase = process.env.WALLET_SEED; // box owner's wallet
  if (!blockfrostKey || !seedPhrase) {
    throw new Error("Set BLOCKFROST_PROJECT_ID and WALLET_SEED in .env");
  }

  const lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preprod.blockfrost.io/api/v0",
      blockfrostKey
    ),
    NETWORK
  );
  lucid.selectWalletFromSeed(seedPhrase);

  const scriptCbor = JSON.parse(
    fs.readFileSync("../contracts/plutus.json", "utf-8")
  ).validators[0].compiledCode;
  const validator = { type: "PlutusV3" as const, script: scriptCbor };
  const scriptAddress = lucid.utils.validatorToAddress(validator);

  const allUtxos = await lucid.utxosAt(scriptAddress);
  const target = allUtxos.find(
    (u) => u.txHash === txHash && u.outputIndex === Number(indexStr)
  );
  if (!target) throw new Error("UTxO not found at script address");

  const redeemer = Data.to(new Constr(0, [secretHex]));

  const tx = await lucid
    .newTx()
    .collectFrom([target], redeemer)
    .attachSpendingValidator(validator)
    .complete();

  const signedTx = await tx.sign().complete();
  const submittedHash = await signedTx.submit();

  console.log("Redeemed. Tx hash:", submittedHash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
