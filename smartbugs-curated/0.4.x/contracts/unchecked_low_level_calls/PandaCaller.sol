pragma solidity ^0.4.24;

import "../dataset/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol";
contract PandaCaller {
    PandaCore public pandaCore;

    function PandaCaller(address _pandaCore) public {
        pandaCore = PandaCore(_pandaCore);
    }

    function call(uint256 _matronId, uint256[2] _childGenes, uint256[2] _factors) public {
        uint babyId = pandaCore.giveBirth(_matronId, _childGenes, _factors);
    }

    function withdraw() public {
        pandaCore.withdrawBalance();
    }

    function() external payable {
        revert("I always revert!");
    }
}