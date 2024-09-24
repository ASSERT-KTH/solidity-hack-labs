const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for modifier_reentrancy.sol", function () {  
    let ModifierEntrancy;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract

        // Deploy ModifierEntrancy contract with Log address
        ModifierEntrancy = await ethers.getContractFactory("contracts/dataset/reentrancy/modifier_reentrancy.sol:ModifierEntrancy");
        victim = await ModifierEntrancy.deploy();
        await victim.waitForDeployment();
        //await victim.setLog(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with ModifierEntrancy address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/modifier_reentrancy_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it("should successfully drain funds through reentrancy attack", async function () {


        // Set hacker balance to 0
        await network.provider.send("hardhat_setBalance", [
            hacker.target,
            "0x0",
          ]);
        let hackerBalance = await ethers.provider.getBalance(hacker.target);
        expect(hackerBalance).to.equal(0);

        let hackerBalanceOnVictim= await victim.tokenBalance(hacker.target);
        expect(hackerBalanceOnVictim).to.equal("0");

        // Perform reentrancy attack through MaliciousContract
        await hacker.initiateAttack();
        
        // Check balances after attack on the victim contract
        const victimBalance = await victim.tokenBalance(victim.target);
        hackerBalanceOnVictim= await victim.tokenBalance(hacker.target);
    

        // Verify the attack was successful
        

        // we verified the hacker has more than the 20 from first call 
        expect(hackerBalanceOnVictim).to.be.above("20");
        
    });
    });
  