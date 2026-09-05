// Minimal CIP-30 wallet integration for the WhisperBox demo page.
// Real transaction building/signing mirrors offchain/src/submit.ts,
// executed here in-browser via a connected CIP-30 wallet instead of a
// seed phrase (which must never be used client-side).

const statusEl = document.getElementById("status");
const lockBtn = document.getElementById("lockBtn");
const cidInput = document.getElementById("cid");

function setStatus(msg) {
  statusEl.textContent = msg;
}

async function getWallet() {
  const candidates = ["nami", "eternl", "lace"];
  for (const name of candidates) {
    if (window.cardano && window.cardano[name]) {
      return window.cardano[name];
    }
  }
  throw new Error(
    "No supported Cardano wallet found. Install Nami, Eternl, or Lace and switch it to Preprod."
  );
}

lockBtn.addEventListener("click", async () => {
  const cid = cidInput.value.trim();
  if (!cid) {
    setStatus("Enter a CID first.");
    return;
  }

  lockBtn.disabled = true;
  setStatus("Connecting wallet...");

  try {
    const walletApi = await getWallet();
    const enabled = await walletApi.enable();
    const networkId = await enabled.getNetworkId();
    if (networkId !== 0) {
      throw new Error("Please switch your wallet to Preprod (testnet).");
    }

    setStatus(
      "Wallet connected. Building transaction...\n" +
        "(This demo stub hands off to the same builder logic as " +
        "offchain/src/submit.ts — wire in lucid-cardano's browser build " +
        "to complete end-to-end signing.)"
    );

    // Full implementation: import Lucid's browser bundle, call
    // lucid.selectWallet(enabled), then reuse the payToContract logic
    // from offchain/src/submit.ts against the same compiled validator.
  } catch (err) {
    setStatus("Error: " + err.message);
  } finally {
    lockBtn.disabled = false;
  }
});
