# Cross-Chain Zcash/Mina

Private Cross-Chain Transfers Using Circom, SnarkJS & Mina Recursive SNARKs.

A fully privacy-preserving cross-chain bridge that connects Zcash Testnet with Mina Protocol Testnet, enabling shielded transfers using a combination of Circom Groth16 proofs and Mina’s recursive zero-knowledge proofs.

This is project is a Proof-of-Concept privacy-preserving cross-chain bridge where:

- Zcash acts as the source chain containing private/shielded deposits.

- Mina Protocol acts as the verifier chain using its lightweight recursive zk-SNARKs to verify a compressed proof about a Zcash-side deposit.

- No Zcash private data ever leaves the watcher, and Mina learns only a tiny zero-knowledge proof, not the deposit details.

License: MIT
Built with: Circom · SnarkJS · o1js · Mina zkApps · TypeScript

---

## 🌟 Key Features

🔒 Privacy-First Architecture

### Zcash-Side Privacy

- Witness generated off-chain from shielded Zcash transaction data

- No private Zcash data ever touches Mina

- All inputs to Mina are zero-knowledge proofs only

### Recursive Proof Verification on Mina

- Mina ZkProgram (ProofProgram) produces recursive proofs

- Arbitrarily many Zcash proofs can be aggregated

- Minimal On-Chain Footprint

### Mina only stores:

- A commitment of the deposit

- A recursive SNARK attesting validity

- Optional public metadata

## 🔁 True Cross-Chain Flow

### Zcash Testnet → [Circom → SnarkJS] → Mina → zkApp State Update

Zcash shielded deposits are:

- Observed by a watcher

- Proven using Circom (Groth16)

- Recursively verified on Mina

- Minted as wrapped balances inside a Mina zkApp

---

## 📦 Multiple Components

- Zcash Relayer
Watches Zcash testnet & generates Circom proofs for each deposit.

- Circom ZK Circuits
Poseidon preimage circuit (extendable to real Orchard note commitment verification).

- SnarkJS Prover Pipeline
Used to generate Groth16 proofs and public inputs.

- Mina o1js Recursive Proof Program
Verifies the Circom proof inside a recursive SNARK.

- Mina zkApp Bridge Contract
Accepts deposits and stores validated commitments.

- Mock Mina Verifier (local)
Demonstrates logic flow without chain interaction.

- Frontend (HTML)
Displays deposit events and proof statuses.

---

## 🔐 Privacy Model
✔ Zcash Privacy → Preserved

- All witness data sourced from shielded transaction tree is never published

- Only a Groth16 proof and public input hash leave the relayer

✔ Mina Receives Zero Knowledge Only

- Mina validators only see:

- A Circom Groth16 proof

- A recursive Mina proof

- A public commitment (e.g., Poseidon hash)

✔ No Trusted Third Parties

- The relayer is not trusted

- Mina verifies cryptographic authenticity

- No centralized attestation keys

---
## 🏗️ Architecture

---
cross_chain_zcash_mina/
│
├── relayer/                   # Zcash watcher + proof generator
│   ├── relayer.ts             # monitors Zcash & triggers proofs
│
├── circom/
│   ├── preimage.circom        # Poseidon circuit (toy)
│   ├── generate_proof.sh      # real / mock prover pipeline
│   └── proof/                 # output proofs for Mina
│
├── mina_o1js/
│   ├── src/
│   │   ├── ProofProgram.ts    # recursive ZK program
│   │   └── BridgeZkApp.ts     # Mina zkApp state contract
│   └── scripts/
│       └── prove_and_submit.js# proof generation + submit
│
├── mina/
│   └── mock_verifier.ts       # local demonstration server
│
├── frontend_demo/
│   └── index.html             # basic UI for demonstration
│
└── demo_runner.sh             # orchestrates entire pipeline
---
---
### ▶️ Quick Start (Local)

1. Clone the Repository
- git clone https://github.com/cryptosfinders/cross_chain_zcash_mina.git
- cd cross_chain_zcash_mina

2. Start mock Mina verifier
cd mina
npm install
npm start

3. Start relayer
cd relayer
npm install
npm start

4. View the frontend

Open:

frontend/index.html

---

## 🧪 Core Technologies
### Circom 2.0

Used to generate the initial ZK proof about a Zcash deposit.

### SnarkJS

Runs:

- Setup

- Proving

- Verification

- Witness generation

### Mina o1js

Used to create the recursive proof verifying the Circom proof.

### Mina zkApp

Smart-contract-like account storing:

- commitments

- attestation flags

- balances for wrapped assets

### TypeScript

All relayer, scripts, and Mina logic is TS-based.

---

## 📚 Zcash → Mina Proof Flow 
### 1️⃣ Zcash deposit occurs

Relayer monitors Zcash testnet (mocked in this PoC).

### 2️⃣ Witness generated

Using:

- Note commitment

- Nullifier

- Position

- Poseidon preimage (toy)

### 3️⃣ Circom proof generated
cd circom
./generate_proof.sh
# outputs proof.json + public.json

### 4️⃣ Mina recursive proof generated
cd mina_o1js
node scripts/prove_and_submit.js --fee-payer-key <key.json> --zkapp-address <address>

### 5️⃣ Mina zkApp executes acceptDeposit()

Updates:

- deposit count

- commitments

- user balances

---

## 🚀 Quick Start (Full ZK Pipeline)

---
1. Generate the Circom proof
cd circom
./generate_proof.sh

2. Produce recursive proof & optionally auto-submit
cd mina_o1js
node scripts/prove_and_submit.js \
  --fee-payer-key ./fee_payer_key.json \
  --zkapp-address <BRIDGE_ADDR> \
  [--auto-submit]

3. Alternatively run orchestrator
./demo_runner.sh \
  --fee-payer-key ./fee_payer_key.json \
  --zkapp-address <BRIDGE_ADDR>
---
---

## 🛠 Smart Contract Overview
### BridgeZkApp.sol (in o1js)

- Stores verified commitments

- Ensures one-time spend

- Maintains wrapped balance storage

### ProofProgram.ts

Handles:

- Recursive verification of Circom Groth16 proof

- Public input checking

- utput of on-chain verifiable Mina proofs

---

## 🪄 Frontend 

Simple HTML dashboard:

- Displays deposit proofs

- Shows statuses (verified/unverified)

- Good for hackathon presentation

---
## 🛡 Security & Limitations

⚠️ This is a PoC. Not suitable for mainnet usage.

- No real shielded key handling

- Mock Zcash event generation

- Toy Circom circuits (not Orchard spec)

- No slashing or relayer dispute protocol

Future improvements:

- Real Zcash Orchard inclusion proof

- Multi-relayer system

- Two-way bridging (Mina → Zcash)

- Production-grade circuit audits

## 🤝 Contributions

PRs welcome.
For larger contributions, open an issue first.

## 📄 License

MIT

## 🙏 Acknowledgments

- Zcash Foundation — privacy infrastructure

- Electric Coin Company — Zcash protocol design

- Mina Foundation & O(1) Labs — recursive zk platform

- Iden3 / Circom — ZK circuit tooling

## 📧 Contact

For support, collaboration, or technical questions:

- **GitHub**: [@cryptosfinders](https://github.com/cryptosfinders) 
- **Twitter**: [@cryptos_finders](https://x.com/cryptos_finders)
