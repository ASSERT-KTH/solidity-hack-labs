/*
 * @source: https://github.com/sigp/solidity-security-blog
 * @author: -
 * @vulnerable_at_lines: 17
 */

pragma solidity ^0.4.22;

contract FindThisHash {
    bytes32 constant public hash = 0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0;

    constructor() public payable {} // load with ether

    function solve(string solution) public {
        // If you can find the pre image of the hash, receive 1000 ether
         // <yes> <report> FRONT_RUNNING
        require(hash == sha3(solution));
        msg.sender.transfer(1000 ether);
    }
}
