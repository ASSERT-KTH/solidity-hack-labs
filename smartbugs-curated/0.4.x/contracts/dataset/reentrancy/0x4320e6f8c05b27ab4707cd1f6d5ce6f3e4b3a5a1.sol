
/*
 * @source: etherscan.io 
 * @author: -
 * @vulnerable_at_lines: 55
 */

pragma solidity ^0.4.19;
import 'hardhat/console.sol';
contract ACCURAL_DEPOSIT
{
    mapping (address=>uint256) public balances;   
   
    uint public MinSum = 1 ether;
    
    LogFile Log = LogFile(0x0486cF65A2F2F3A392CBEa398AFB7F5f0B72FF46);
    
    bool intitalized;
    
    function SetMinSum(uint _val)
    public
    {
        if(intitalized)revert();
        MinSum = _val;
    }
    
    function SetLogFile(address _log)
    public
    {
        if(intitalized)revert();
        Log = LogFile(_log);
    }
    
    function Initialized()
    public
    {
        intitalized = true;
    }
    
    function Deposit()
    public
    payable
    {
        console.log('Sending: %s  from %s', msg.value, msg.sender);
        balances[msg.sender]+= msg.value;
        Log.AddMessage(msg.sender,msg.value,"Put");
    }
    
    function Collect(uint _am)
    public
    payable
    {
        console.log('FROM COLLECT FUNCTION');
        console.log('collecting:        %s ', _am);
        //console.log('address attacker %s', msg.sender);
        console.log('HACKER BEFORE:     %s', address(msg.sender).balance);
        console.log('balance on victim: %s', balances[msg.sender]);
        if(balances[msg.sender]>=MinSum && balances[msg.sender]>=_am)
        {
            // <yes> <report> REENTRANCY
            if(msg.sender.call.value(_am)())
            {
                console.log('HACKER BEFORE:        %s', address(msg.sender).balance);
                console.log('balance on victim:    %s', balances[msg.sender]);
                balances[msg.sender]-=_am;
                console.log('HACKER AFTER:         %s', address(msg.sender).balance);
                Log.AddMessage(msg.sender,_am,"Collect");
            }
            console.log('FALSE');
        }
    }
    
    function() 
    public 
    payable
    {
        console.log('fallback function');
        Deposit();
    }
    
}



contract LogFile
{
    struct Message
    {
        address Sender;
        string  Data;
        uint Val;
        uint  Time;
    }
    
    Message[] public History;
    
    Message LastMsg;
    
    function AddMessage(address _adr,uint _val,string _data)
    public
    {
        LastMsg.Sender = _adr;
        LastMsg.Time = now;
        LastMsg.Val = _val;
        LastMsg.Data = _data;
        History.push(LastMsg);
    }
}