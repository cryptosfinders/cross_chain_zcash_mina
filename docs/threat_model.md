# Threat Model (PoC)

## Assets
- Wrapped test tokens (on Mina testnet)
- Relayer keys (mock)

## Adversaries
- Malicious relayer submitting fake proofs
- Replay attacks (submitting same deposit twice)
- Front-running / race attacks on redemption
- Information leakage via lightwalletd usage

## Mitigations (PoC & roadmap)
- PoC: verifier rejects duplicate deposit_id, checks signature heuristic
- Roadmap: replace mock-sig with real zk-proof & aggregated verification on Mina
- Timelock & challenge windows to allow disputes & slashing
- Use relayer staking and distributed/threshold relayer set for trust minimization
- Run private lightwalletd instances to preserve user privacy
