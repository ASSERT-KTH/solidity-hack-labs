pragma solidity 0.4.24;

contract RevertContract {
    // Fallback function that will fail on purpose
    function() external payable {
        revert("I always revert!");
    }

    function sendEther(address _to) public payable {
        (bool success, ) = _to.call.value(msg.value)("");
        require(success, "Ether transfer failed");
    }

    function withdrawEther(address _from) public {
        bytes4 data = bytes4(keccak256("withdraw()"));
        (bool success, ) = _from.call(data);
        require(success, "Ether transfer failed");
    }
}
