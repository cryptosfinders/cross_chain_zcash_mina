#!/usr/bin/env bash
set -e
# test_runner.sh
# Orchestrates the full pipeline: circom compile/prove (if available), snarkjs verify, then invoke mina_o1js prove_and_submit.js
# This script does not auto-deploy contracts; it assumes the Bridge zkApp address and fee payer key are provided.

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
CIRCOM_DIR="$REPO_ROOT/circom"
MINA_O1JS_DIR="$REPO_ROOT/mina_o1js"

echo "Test runner starting..."
echo "1) Optionally compile circom circuit and produce real Groth16 proof (requires circom & snarkjs)."
echo "   If you already have circom/proof/proof.json and public.json, skip to step 2."

read -p "Do you want to run the circom pipeline now? (y/n) " run_circom
if [ "$run_circom" = "y" ]; then
  echo "Compiling circom circuit..."
  (cd "$CIRCOM_DIR" && npx circom preimage.circom --r1cs --wasm --sym -o build)
  echo "Running trusted setup (you must provide or download a ptau file):"
  echo "  npx snarkjs groth16 setup build/preimage.r1cs pot12_final.ptau build/circuit_0000.zkey"
  echo "  npx snarkjs zkey contribute build/circuit_0000.zkey build/circuit_final.zkey --name=\"demo contribution\" -v"
  echo "  npx snarkjs zkey export verificationkey build/circuit_final.zkey build/verification_key.json"
  echo "Prepare input.json in circom/ and run witness & prove:"
  echo "  node build/preimage_js/generate_witness.js build/preimage_js/preimage.wasm input.json witness.wtns"
  echo "  npx snarkjs groth16 prove build/circuit_final.zkey witness.wtns proof.json public.json"
  echo "If these succeed, copy proof.json and public.json to circom/proof/ (the relayer & mina script expect them there)."
  echo
fi

echo "2) Verify proof locally using snarkjs (if available)."
if command -v snarkjs >/dev/null 2>&1; then
  echo "Running snarkjs verify..."
  if [ -f "$CIRCOM_DIR/build/verification_key.json" ] && [ -f "$CIRCOM_DIR/proof/public.json" ] && [ -f "$CIRCOM_DIR/proof/proof.json" ]; then
    snarkjs groth16 verify "$CIRCOM_DIR/build/verification_key.json" "$CIRCOM_DIR/proof/public.json" "$CIRCOM_DIR/proof/proof.json"
  else
    echo "verification_key.json or proof/public.json or proof/proof.json not found; ensure you produced them."
  fi
else
  echo "snarkjs not found on PATH; skipping local verification."
fi

echo "3) Invoke mina_o1js prove_and_submit.js to produce a Mina recursive proof and print zk send instructions."
echo "Usage: test_runner.sh --fee-payer-key ./fee_payer_key.json --zkapp-address <BRIDGE_ZKAPP_ADDRESS>"
if [ "$#" -lt 2 ]; then
  echo "You may pass --fee-payer-key and --zkapp-address as arguments to this script; they will be forwarded."
fi

node "$MINA_O1JS_DIR/scripts/prove_and_submit.js" "$@"

echo "Test runner finished. Follow onscreen instructions to `zk send` the generated proof to the zkApp."

# To auto-submit the produced Mina recursive proof to Devnet, pass --auto-submit to the prove_and_submit.js via this script.
