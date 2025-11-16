# Demo Video Script (2–3 minutes)

00:00 - 00:20  Intro (problem + approach)
- "We built a privacy-preserving bridge PoC between Zcash and Mina that demonstrates how Mina's recursion can verify cross-chain deposit proofs succinctly."

00:20 - 00:45  Architecture walkthrough (30s)
- Show the animated architecture diagram: Zcash wallet -> watcher -> prover -> Mina verifier -> wrapped token.
- Say: all cryptographic proofs are mocked for the demo; real implementation replaces them with SNARK/STARK proofs.

00:45 - 01:30  Live demo (45s)
- Show the frontend (index.html) refreshing deposits and Mina submissions. 
- Switch to the relayer terminal: show logs of mock deposits being generated and submitted to Mina mock verifier.
- Switch to the Mina mock verifier terminal: show accepted submissions and printed events.

01:30 - 02:10  Explain recursion & roadmap (40s)
- Explain the toy SNARK circuit generated via circom that validates a simple preimage/signature; explain how Mina could recursively verify such proofs.
- Show the circom folder and the `npm run` script list for compile/setup/prove/verify (note: for the demo we used a toy circuit).

02:10 - 02:30  Security and next steps (20s)
- Summarize security: timelocks, challenge windows, relayer staking, and audit roadmap.
- Call to action: ask for mentors, audit credits, and integration help for real proofs.

02:30 - 03:00  Closing (30s)
- Reiterate the novelty: Mina recursion + Zcash privacy = scalable private cross-chain transfers.
- Thank the judges and invite questions.
