const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for reentrancy_bonus.sol", function () {
  let Reentrancy_bonus;
  let victim;
  let MaliciousContract;
  let hacker;

  beforeEach(async function () {
    // Deploy Log contract

    // Deploy PrivateBank contract with Log address
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/reentrancy_bonus.sol/Reentrancy_bonus.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    Reentrancy_bonus = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await Reentrancy_bonus.deploy();
    await victim.waitForDeployment();

    // Deploy MaliciousContract with Reentrancy_bonus address
    MaliciousContract = await ethers.getContractFactory(
      "contracts/reentrancy/reentrancy_bonus_attack.sol:MaliciousContract",
    );
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("sanity check: reentrancy/reentrancy_bonus.sol", async function () {
    await expect(victim.withdrawReward(hacker.target)).to.not.be.reverted;
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Add funds to the contract by sending ether directly
    await network.provider.send("hardhat_setBalance", [
      victim.target,
      "0x0100",
    ]);

    // Check the contract balance to confirm funds were added
    const balance = await ethers.provider.getBalance(victim.target);
    expect(balance).to.equal(256);

    // Set hacker balance to 0
    await network.provider.send("hardhat_setBalance", [hacker.target, "0x0"]);
    let hackerBalance = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalance).to.equal(0);

    // Perform reentrancy attack through MaliciousContract
    await hacker.attack();

    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    hackerBalance = await ethers.provider.getBalance(hacker.target);

    // Verify the attack was successful

    // hacker gets more than the initial bonus 100
    expect(hackerBalance).to.be.above(100);
  });
});
