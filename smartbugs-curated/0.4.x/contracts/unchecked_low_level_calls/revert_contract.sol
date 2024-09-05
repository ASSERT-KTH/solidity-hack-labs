pragma solidity 0.4.25;

contract RevertContract {

    // Fallback function that will fail on purpose
    function() external payable {
        revert("I always revert!");
    }
}