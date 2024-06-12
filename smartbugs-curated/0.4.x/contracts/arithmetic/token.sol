/*
 * @source: https://github.com/sigp/solidity-security-blog
 * @author: Steve Marx
 * @vulnerable_at_lines: 20,22
 */

 pragma solidity ^0.4.18;

 contract Token {

    event Transfer(address indexed from, address indexed to, uint value);
    event Success(string message);

   mapping(address => uint) balances;
   uint public totalSupply;

   function Token(uint _initialSupply) {
     balances[msg.sender] = totalSupply = _initialSupply;
   }

   function transfer(address _to, uint _value) public returns (bool) {
     // <yes> <report> ARITHMETIC
     emit Transfer(msg.sender, _to, _value);
     require(balances[msg.sender] - _value >= 0);

     emit Success("Transfer successful");
     // <yes> <report> ARITHMETIC
     balances[msg.sender] -= _value;
     balances[_to] += _value;
     return true;
   }

   function balanceOf(address _owner) public constant returns (uint balance) {
     return balances[_owner];
   }
 }
