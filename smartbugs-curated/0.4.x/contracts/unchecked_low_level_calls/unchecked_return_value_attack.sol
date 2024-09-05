pragma solidity 0.4.25;

contract ReturnValueAttacker {

    // Fallback function that will fail on purpose
    function() external payable {
        revert("I am malicious!");
    }
}