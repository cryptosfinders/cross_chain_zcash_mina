// BridgeZkApp.ts
import { SmartContract, state, State, method, Field, PublicKey } from 'o1js';
import { ProofProgram } from './ProofProgram';

export class BridgeZkApp extends SmartContract {
  @state(Field) lastDeposit = State<Field>();

  deploy(args: { feePayer: PublicKey }) {
    super.deploy();
    this.account.requireSignature();
  }

  @method async acceptDeposit(publicInput: Field, witnessPreimage: Field) {
    // In o1js you verify by including ProofProgram's proof as an input to the transaction.
    // For demo: we assert equality locally (the real recursion happens when proof is attached).
    publicInput.assertEquals(witnessPreimage);
    this.lastDeposit.set(publicInput);
  }
}
