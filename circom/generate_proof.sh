#!/usr/bin/env bash
set -e
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)/.."
CIRCUIT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$CIRCUIT_DIR/build"
PROOF_DIR="$CIRCUIT_DIR/proof"

mkdir -p "$PROOF_DIR"
echo "Attempting real circom compile & snarkjs prove flow if tools are available..."

# Check for circom and snarkjs
if command -v circom >/dev/null 2>&1 && command -v snarkjs >/dev/null 2>&1; then
  echo "Found circom and snarkjs on PATH. Running full pipeline..."

  # compile the circuit
  circom "$CIRCUIT_DIR/preimage.circom" --r1cs --wasm --sym -o "$BUILD_DIR"

  # require a ptau file; look for a nearby pot12_final.ptau or prompt the user (non-interactive fallback)
  PTAU="${CIRCUIT_DIR}/pot12_final.ptau"
  if [ ! -f "$PTAU" ]; then
    echo "ptau not found at $PTAU. Looking for pot12_final.ptau in $CIRCUIT_DIR"
    # try to download a small test ptau (not shipped). If absent, instruct the user.
    echo "Please download a pot12_final.ptau to circom/ or set PTAU variable."
    echo "Falling back to toy-proof generation."
  else
    echo "Using PTAU at $PTAU"
    # setup and prove (Groth16)
    snarkjs groth16 setup "$BUILD_DIR/preimage.r1cs" "$PTAU" "$BUILD_DIR/circuit_0000.zkey"
    snarkjs zkey contribute "$BUILD_DIR/circuit_0000.zkey" "$BUILD_DIR/circuit_final.zkey" --name="demo contribution" -v
    snarkjs zkey export verificationkey "$BUILD_DIR/circuit_final.zkey" "$BUILD_DIR/verification_key.json"

    # prepare input.json (if present copy it)
    if [ -f "$CIRCUIT_DIR/input.json" ]; then
      cp "$CIRCUIT_DIR/input.json" "$BUILD_DIR/input.json"
    else
      echo '{"preimage":"1234"}' > "$BUILD_DIR/input.json"
    fi

    node "$BUILD_DIR/preimage_js/generate_witness.js" "$BUILD_DIR/preimage_js/preimage.wasm" "$BUILD_DIR/input.json" "$BUILD_DIR/witness.wtns"
    snarkjs groth16 prove "$BUILD_DIR/circuit_final.zkey" "$BUILD_DIR/witness.wtns" "$BUILD_DIR/proof.json" "$BUILD_DIR/public.json"

    # copy outputs to proof dir for downstream steps
    cp "$BUILD_DIR/proof.json" "$PROOF_DIR/proof.json"
    cp "$BUILD_DIR/public.json" "$PROOF_DIR/public.json"
    cp "$BUILD_DIR/verification_key.json" "$PROOF_DIR/verification_key.json" || true

    echo "Produced real proof at $PROOF_DIR/proof.json and public.json"
    exit 0
  fi
fi

echo "Real toolchain not available or ptau missing — writing toy proof to $PROOF_DIR/proof.json"
cat > "$PROOF_DIR/proof.json" <<'JSON'
{ "circom_proof": "demo-proof", "notes": "Toy proof (fallback).", "timestamp": "'"$(date --iso-8601=seconds)"'" }
JSON
cat > "$PROOF_DIR/public.json" <<'JSON'
{ "publicInputs": [1234] }
JSON
echo "Wrote toy proof and public.json"
