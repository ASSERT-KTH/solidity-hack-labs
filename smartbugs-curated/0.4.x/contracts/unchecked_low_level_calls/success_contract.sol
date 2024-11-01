pragma solidity 0.4.25;

contract SuccessContract {
    mapping(address => uint256) public balanceOf;

    constructor() public {
        balanceOf[msg.sender] = 10 ether;
    }

    function transferFrom(address from, address to, uint256 amount) public {
        require(balanceOf[from] >= amount);
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) public {
        require(balanceOf[msg.sender] >= amount);
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
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

    // it should accept any call without reverting
    function() external payable {}
}
