# Suggested commit sequence

This isn't required, but committing the project in stages (instead of
one big dump) gives you a real, legible history — and it's what the
"15 meaningful commits" requirement is actually checking for. Suggested
order:

1. `chore: init repo, license, gitignore`
2. `feat(contracts): add aiken project scaffold`
3. `feat(contracts): implement WhisperBox commitment validator`
4. `test(contracts): aiken check passes`
5. `feat(offchain): add package scaffold + tsconfig`
6. `feat(offchain): implement submit.ts (lock transaction)`
7. `feat(offchain): implement redeem.ts (unlock transaction)`
8. `test(offchain): add commit-hash unit tests`
9. `feat(frontend): add minimal UI shell`
10. `feat(frontend): wire up CIP-30 wallet connect`
11. `ci: add GitHub Actions workflow`
12. `docs: add README with product overview`
13. `docs: add SETUP.md`
14. `docs: add USAGE.md`
15. `chore: deploy to Preprod, update README with live addresses/links`
16. `docs: link X profile and demo video`

Make real edits at each stage (even small ones) rather than committing
already-finished files — that's what makes the history meaningful
instead of decorative.
