import express from 'express'
import bodyParser from 'body-parser'

const app = express()
app.use(bodyParser.json())

const processed = new Set<string>()

function verifyMockSignature(payloadB64: string, signature: string) {
  try {
    const raw = Buffer.from(payloadB64, 'base64').toString('utf8')
    return signature && signature.length > 10 && raw.length > 0
  } catch (e) { return false }
}

// Simulate recursive verification of a circom proof: ensure circom_proof exists and has expected field
function verifyCircomProof(proof: any) {
  if (!proof) return false
  if (proof.circom_proof && proof.notes) return true
  return false
}

app.post('/mina/submit', (req, res) => {
  const sub = req.body
  if (!sub || !sub.deposit_id || !sub.proof_blob) return res.status(400).json({error:'missing'})
  if (processed.has(sub.deposit_id)) return res.status(409).json({error:'replay'})
  const proof = sub.proof_blob
  if (proof.proof_type !== 'mock-sig') return res.status(400).json({error:'bad_type'})
  if (!verifyMockSignature(proof.payload_b64, proof.signature)) return res.status(400).json({error:'bad_sig'})

  // If a circom proof was attached, simulate recursive verification
  if (proof.circom_proof) {
    const ok = verifyCircomProof(proof.circom_proof)
    if (!ok) return res.status(400).json({ error: 'circom_proof_invalid' })
  }

  processed.add(sub.deposit_id)
  console.log('Accepted mock deposit on Mina:', sub.deposit_id, '-> credit', sub.recipient_mina_pk)
  return res.json({status:'accepted', deposit_id: sub.deposit_id})
})

const PORT = Number(process.env.PORT || 5001)
app.listen(PORT, ()=> console.log('Mock Mina verifier listening on', PORT))
