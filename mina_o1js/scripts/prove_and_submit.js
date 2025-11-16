/**
 * prove_and_submit.js (enhanced for auto-submit)
 *
 * Flow:
 *  - Verify circom proof with snarkjs (if available)
 *  - Call ProofProgram.prove() to produce Mina recursive proof (if available)
 *  - Optionally auto-submit via `zk send` when --auto-submit flag is provided
 *
 * Usage:
 *   node prove_and_submit.js --fee-payer-key ./fee_payer_key.json --zkapp-address <BRIDGE_ZKAPP_ADDRESS> [--auto-submit]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import process from 'process';
import {
  isReady,
  shutdown,
  Field,
  PrivateKey,
  PublicKey
} from 'o1js';

import { ProofProgram } from '../src/ProofProgram';
import { BridgeZkApp } from '../src/BridgeZkApp';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { autoSubmit: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fee-payer-key') { out.feeKey = args[++i]; }
    else if (args[i] === '--zkapp-address') { out.zkapp = args[++i]; }
    else if (args[i] === '--auto-submit') { out.autoSubmit = true; }
    else if (args[i] === '--circom-proof') { out.circomProof = args[++i]; }
    else if (args[i] === '--public-json') { out.publicJson = args[++i]; }
  }
  return out;
}

async function main() {
  const cfg = parseArgs();
  if (!cfg.feeKey || !cfg.zkapp) {
    console.error('Usage: node prove_and_submit.js --fee-payer-key ./fee_payer_key.json --zkapp-address <BRIDGE_ZKAPP_ADDRESS> [--auto-submit]');
    process.exit(1);
  }

  const repoRoot = path.resolve(path.join(__dirname, '..', '..'));
  const circomProofPath = cfg.circomProof || path.join(repoRoot, 'circom', 'proof', 'proof.json');
  const publicJsonPath = cfg.publicJson || path.join(repoRoot, 'circom', 'proof', 'public.json');

  if (!fs.existsSync(circomProofPath) || !fs.existsSync(publicJsonPath)) {
    console.error('circom proof or public.json not found. Run the circom pipeline or ensure files exist.');
    process.exit(1);
  }

  // 1) Verify with snarkjs if available
  try {
    const vkPath = path.join(repoRoot, 'circom', 'build', 'verification_key.json');
    if (fs.existsSync(vkPath)) {
      console.log('Running snarkjs verify using verification key at', vkPath);
      const cmd = `snarkjs groth16 verify ${vkPath} ${publicJsonPath} ${circomProofPath}`;
      console.log('> ', cmd);
      const out = execSync(cmd, { encoding: 'utf8' });
      console.log(out);
    } else {
      console.warn('verification_key.json not found; skipping snarkjs verify step.');
    }
  } catch (err) {
    console.error('snarkjs verification failed or snarkjs not installed. Error:', err.message || err);
    console.error('You may still proceed if you trust the produced proof.json.');
  }

  // 2) Produce a Mina recursive proof using ProofProgram.prove()
  await isReady;

  const publicInput = Field(1234); // in production, read from public.json
  const witnessPreimage = Field(1234);

  let producedProof = null;
  try {
    if (typeof ProofProgram.prove === 'function') {
      console.log('Producing Mina recursive proof via ProofProgram.prove()...');
      producedProof = await ProofProgram.prove({ publicInput }, { witnessPreimage });
      const outPath = path.join(repoRoot, 'mina_o1js', 'produced_proof.json');
      fs.writeFileSync(outPath, JSON.stringify(producedProof, null, 2));
      console.log('Wrote produced Mina proof to', outPath);
    } else {
      console.warn('ProofProgram.prove() not available in this o1js version. Please produce the Mina recursive proof via your local tooling.');
    }
  } catch (e) {
    console.error('Error producing Mina proof:', e && e.message ? e.message : e);
  }

  // 3) Auto-submit via zk CLI if requested
  if (cfg.autoSubmit) {
    if (!producedProof) {
      console.error('Auto-submit requested but no produced Mina proof available. Aborting auto-submit.');
    } else {
      // Build a safe zk send command. Note: flags may vary by zx CLI version.
      const feeKey = cfg.feeKey;
      const zkapp = cfg.zkapp;
      const proofFile = path.join(repoRoot, 'mina_o1js', 'produced_proof.json');
      const cmd = `zk send --network devnet --fee-payer-key ${feeKey} --contract ${zkapp} --method acceptDeposit --args '[1234,1234]' --proof-file ${proofFile}`;
      console.log('Auto-submit: running:', cmd);
      try {
        const res = execSync(cmd, { stdio: 'inherit' });
        console.log('zk send returned:', res ? res.toString() : '(no output)');
      } catch (sendErr) {
        console.error('zk send failed:', sendErr && sendErr.message ? sendErr.message : sendErr);
        console.error('You can manually run the printed zk send command.');
      }
    }
  } else {
    console.log('Auto-submit not requested. To submit, run zk send with the produced Mina recursive proof.');
    if (producedProof) {
      console.log('Produced proof written to mina_o1js/produced_proof.json');
      console.log(`Example zk send (adjust flags for your zk CLI):
zk send --network devnet --fee-payer-key ${cfg.feeKey} --contract ${cfg.zkapp} --method acceptDeposit --args '[1234,1234]' --proof-file mina_o1js/produced_proof.json`);
    }
  }

  await shutdown();
  process.exit(0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
