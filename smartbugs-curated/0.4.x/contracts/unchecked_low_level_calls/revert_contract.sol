pragma solidity 0.4.25;

import "hardhat/console.sol";

contract RevertContract {

    // Fallback function that will fail on purpose
    function() external payable {
        revert("I always revert!");
    }

    function sendEther(address _to) public payable {
    (bool success, ) = _to.call.value(msg.value)("");
    require(success, "Ether transfer failed");
    }
}