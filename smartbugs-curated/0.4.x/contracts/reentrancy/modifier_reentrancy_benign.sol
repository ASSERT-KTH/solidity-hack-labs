pragma solidity ^0.4.24;

import "../dataset/reentrancy/modifier_reentrancy.sol";

contract BankBenign {
    ModifierEntrancy modifierEntrancyInstance;

    constructor(address _victimAddress) public {
        modifierEntrancyInstance = ModifierEntrancy(_victimAddress);
    }

    function supportsToken() external pure returns (bytes32) {
        return (keccak256(abi.encodePacked("Nu Token")));
    }

    function airDrop() public {
        modifierEntrancyInstance.airDrop();
    }
}
