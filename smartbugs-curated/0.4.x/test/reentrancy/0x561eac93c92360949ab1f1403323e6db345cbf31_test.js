const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0x561eac93c92360949ab1f1403323e6db345cbf31.sol", function () {
  let BANK_SAFE;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    const logPath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/0x561eac93c92360949ab1f1403323e6db345cbf31.sol/LogFile.json",
    );
    const logJson = JSON.parse(fs.readFileSync(logPath));
    Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy BANK_SAFE contract with Log address
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/0x561eac93c92360949ab1f1403323e6db345cbf31.sol/BANK_SAFE.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    BANK_SAFE = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await BANK_SAFE.deploy();
    await victim.waitForDeployment();
    await victim.SetLogFile(log.target); // Set Log address after deployment

    // Deploy MaliciousContract with BANK_SAFE address
    MaliciousContract = await ethers.getContractFactory(
      "contracts/reentrancy/0x561eac93c92360949ab1f1403323e6db345cbf31_attack.sol:MaliciousContract",
    );
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("sanity check: reentrancy/0x561eac93c92360949ab1f1403323e6db345cbf31.sol", async function () {
    await expect(victim.Deposit({ value: ethers.parseEther("10") })).to.not.be
      .reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(
      ethers.parseEther("10"),
    );
    await expect(victim.Collect(ethers.parseEther("10"))).to.not.be.reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(0);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.Deposit({ value: ethers.parseEther("5") });

    const victimInitialBalance = await ethers.provider.getBalance(
      victim.target,
    );
    expect(victimInitialBalance).to.equal(ethers.parseEther("5"));

    // Initial deposit from maliciousContract on victim contract
    await hacker.deposit({ value: ethers.parseEther("3") });

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(
      victim.target,
    );
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("8"));

    // Perform reentrancy attack through MaliciousContract
    await hacker.attack(ethers.parseEther("2"));

    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    const maliciousContractBalance = await ethers.provider.getBalance(
      hacker.target,
    );

    // Verify the attack was successful

    // victim has a drained account
    expect(victimBalance).to.be.below(ethers.parseEther("5"));

    // the hacker withdraws more than what he deposited
    expect(maliciousContractBalance).to.be.above(ethers.parseEther("3"));
  });
});
