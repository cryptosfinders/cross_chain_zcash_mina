pragma circom 2.0.0;

// Poseidon preimage circuit (toy): outputs poseidon(preimage) as public hash
// Requires circomlib/poseidon.circom available in include path (npm i circomlib)
include "circomlib/poseidon.circom";

template Preimage() {
    signal input preimage;
    signal output hash;
    component p = Poseidon(1);
    p.inputs[0] <== preimage;
    hash <== p.out;
}

component main = Preimage();
