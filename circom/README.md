Circom toy circuit and snarkjs pipeline

Requirements:
- circom (v2)
- snarkjs
- nodejs (for witness generation)

Scripts (from circom/ directory):
1. npm run compile         # compile circuit -> r1cs, wasm
2. # You need a powers of tau file (ptau). For this project use a small one or download pot12_final.ptau
3. npm run setup           # trusted setup (groth16) - produces circuit_final.zkey
4. npm run export-verifier # export verification key
5. prepare input.json with { "preimage": 1234, "hash": 1234 }
6. npm run witness         # generate witness
7. npm run prove           # generate proof.json and public.json
8. npm run verify          # verify proof locally

Note: This is a toy circuit for demo recursion/flow only.
