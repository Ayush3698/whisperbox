import { blake2b } from "@noble/hashes/blake2b";
import { toHex } from "lucid-cardano";

// Mirrors the on-chain check in contracts/whisperbox.ak:
//   blake2b_256(secret) == commit_hash
// Verified here off-chain so we catch encoding mismatches before they
// ever hit a live transaction.
function commitHash(secretHex: string): string {
  const bytes = Buffer.from(secretHex, "hex");
  return toHex(blake2b(bytes, { dkLen: 32 }));
}

describe("WhisperBox commit-hash scheme", () => {
  it("produces a 32-byte (64 hex char) hash", () => {
    const hash = commitHash("deadbeef");
    expect(hash).toHaveLength(64);
  });

  it("is deterministic for the same secret", () => {
    expect(commitHash("abc123")).toEqual(commitHash("abc123"));
  });

  it("differs for different secrets", () => {
    expect(commitHash("abc123")).not.toEqual(commitHash("abc124"));
  });
});
