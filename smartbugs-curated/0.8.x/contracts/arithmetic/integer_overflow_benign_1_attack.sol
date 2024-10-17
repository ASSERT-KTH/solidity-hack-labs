pragma solidity ^0.8.0;

import "../dataset/arithmetic/integer_overflow_benign_1.sol";

contract IntegerOverflowBenign1Attacker {
    IntegerOverflowBenign1 victimContract;

    constructor (address _victimAddress) {
        victimContract = IntegerOverflowBenign1(_victimAddress);
    }

    function attack() public {
        uint256 count = victimContract.count();
        
        victimContract.run(count);
        victimContract.run(1);
    }
}