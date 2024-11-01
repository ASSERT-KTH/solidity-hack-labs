pragma solidity ^0.4.9;

import "../dataset/unchecked_low_level_calls/0x89c1b3807d4c67df034fffb62f3509561218d30b.sol";
contract TownCrierCaller {
    TownCrier public TC_CONTRACT;
    bytes4 constant TC_CALLBACK_FID =
        bytes4(sha3("response(uint64,uint64,bytes32)"));
    int256 requestId;
    bytes32 public hash;

    event LogResponse(uint64 responseType, uint64 errors, bytes32 data);
    event Received(address sender, uint256 value);

    function TownCrierCaller(address _townCrier) {
        TC_CONTRACT = TownCrier(_townCrier);
    }

    function request(uint8 requestType, bytes32[] requestData) public payable {
        requestId = TC_CONTRACT.request.value(msg.value)(
            requestType,
            this,
            TC_CALLBACK_FID,
            0,
            requestData
        );
        hash = sha3(requestType, requestData);
    }

    function cancel() public {
        TC_CONTRACT.cancel(uint64(requestId));
    }

    function response(uint64 responseType, uint64 errors, bytes32 data) public {
        emit LogResponse(responseType, errors, data);
    }

    function() payable {
        emit Received(msg.sender, msg.value);
    }
}
