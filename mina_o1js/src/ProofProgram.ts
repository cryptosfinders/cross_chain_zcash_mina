// ProofProgram.ts
// Demo ZkProgram: verifies a simple equality between publicInput and witnessPreimage
import { ZkProgram, method, Field } from 'o1js';

export const ProofProgram = ZkProgram({
  publicInput: Field,
  methods: {
    verifyMock: {
      method(publicInput: Field, witnessPreimage: Field) {
        // Toy check: require equality
        publicInput.assertEquals(witnessPreimage);
      }
    }
  }
});
