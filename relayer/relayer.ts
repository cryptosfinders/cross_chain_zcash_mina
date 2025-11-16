/**
Mock Relayer (enhanced): polls a mocked Zcash feed (here: simulated) and produces mock proof blobs,
then runs the circom mock proof generator to produce a proof.json and submits the proof to the Mina mock verifier.
Safe: does not construct shielded spends. Designed for a demo connection Zcash->Circom->Mina.
*/
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const MINAVERIFY_ENDPOINT = process.env.MINA_VERIFY || 'http://localhost:5001/mina/submit'
const RELAYER_SK = process.env.RELAYER_SK || 'demo-relayer-key'
const CIRCOM_DIR = process.env.CIRCOM_DIR || path.join(__dirname, '..', 'circom')

function signMock(obj: any) {
  const raw = JSON.stringify(obj) + '|' + RELAYER_SK
  return Buffer.from(raw).toString('base64')
}

async function submitToMina(submission: any) {
  try {
    const res = await fetch(MINAVERIFY_ENDPOINT, {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify(submission)
    })
    console.log('Mina submit status=', res.status)
    const txt = await res.text()
    console.log('Mina response body:', txt)
  } catch (e) {
    console.error('submit error', e)
  }
}

// helper to call circom generator which writes proof/proof.json
function runCircomProof(witnessObj: any) {
  try {
    // ensure circom dir exists
    const proofDir = path.join(CIRCOM_DIR, 'proof')
    if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true })

    // write an input.json file that the circom script could read (not required by our placeholder generator)
    const inputPath = path.join(CIRCOM_DIR, 'input.json')
    fs.writeFileSync(inputPath, JSON.stringify(witnessObj, null, 2))

    // run the placeholder generator that writes proof/proof.json
    const genScript = path.join(CIRCOM_DIR, 'generate_proof.sh')
    console.log('Running circom proof generator:', genScript)
    execSync(`bash ${genScript}`, { stdio: 'inherit', cwd: CIRCOM_DIR })

    const proofPath = path.join(CIRCOM_DIR, 'proof', 'proof.json')
    if (fs.existsSync(proofPath)) {
      const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'))
      return proof
    } else {
      console.warn('Proof file not found at', proofPath)
      return null
    }
  } catch (e) {
    console.error('Circom proof generation failed:', e)
    return null
  }
}

// Simulate incoming zcash deposit events
setInterval(async () => {
  const deposit = {
    deposit_id: uuidv4(),
    txid: `tx-${Math.random().toString(36).slice(2,8)}`,
    block_height: Math.floor(Math.random()*1e6),
    amount: 1.0,
    recipient_mina_pk: `B62...${Math.random().toString(36).slice(2,6)}`
  }
  const witness = {
    deposit_id: deposit.deposit_id,
    txid: deposit.txid,
    block_height: deposit.block_height,
    amount: deposit.amount,
    watcher_id: 'relayer-1',
    observed_at: new Date().toISOString()
  }
  // create a mock signature payload
  const proof_blob = {
    proof_type: 'mock-sig',
    payload_b64: Buffer.from(JSON.stringify(witness)).toString('base64'),
    signature: signMock(witness),
    prover_id: 'relayer-1',
    created_at: new Date().toISOString()
  }

  // Run circom generator to produce a toy proof.json (demonstrates Zcash->Circom step)
  const circomProof = runCircomProof({ preimage: 1234, hash: 1234 })
  // Attach the circom proof (if produced) into the submission under proof_blob.circom_proof
  if (circomProof) {
    proof_blob.circom_proof = circomProof
  }

  const submission = {
    deposit_id: witness.deposit_id,
    proof_blob,
    recipient_mina_pk: deposit.recipient_mina_pk,
    service_metadata: { watcher: 'relayer-1' }
  }
  console.log('Submitting mock deposit to Mina:', submission.deposit_id)
  await submitToMina(submission)
}, 5000)
