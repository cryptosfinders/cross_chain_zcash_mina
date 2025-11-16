mina_o1js — zkApp scaffold for Zcash ⇄ Mina PoC (demo-safe)

This folder contains a minimal o1js zkApp scaffold demonstrating how to structure a ZkProgram (ProofProgram)
and a SmartContract (BridgeZkApp) that would accept a recursive proof proving a Zcash deposit witness.
Files:

- src/ProofProgram.ts — ZkProgram (toy) that asserts publicInput == witnessPreimage
- src/BridgeZkApp.ts — SmartContract that stores lastDeposit and would accept recursive proof
- scripts/prove_and_submit.js — scaffold script showing how to produce proof and submit transaction

How to use (local dev):
1. Install deps: npm install
2. Build: npm run build
3. Edit scripts/prove_and_submit.js to call ProofProgram.prove() with your inputs (requires o1js)
4. Deploy BridgeZkApp using zkApp CLI or o1js deployment flow (see Mina docs)

IMPORTANT: This demo uses toy equality checks and mock proofs for safety. Replace with real proof generation for production.
