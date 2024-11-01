const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack arithmetic/timeLock.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/arithmetic/timelock.sol/TimeLock.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const TimeLock = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await TimeLock.deploy();
    await victim.waitForDeployment();
    const address = await victim.getAddress();

    const TimeLockAttacker = await ethers.getContractFactory(
      "contracts/arithmetic/timelock_attack.sol:TimeLockAttacker",
    );
    const attacker = await TimeLockAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { victim, attacker };
  }

  it("sanity check: arithmetic/timeLock.sol", async function () {
    const [sig] = await ethers.getSigners();
    const { victim } = await loadFixture(deployContracts);
    await expect(victim.connect(sig).deposit({ value: 1 })).to.not.be.reverted;
    await victim.connect(sig).increaseLockTime(1);
    await time.increase(3600 * 24 * 8);
    await expect(victim.connect(sig).withdraw()).to.not.be.reverted;
    expect(await victim.balances(sig.address)).to.equal(0);
  });

  it("exploit overflow vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);
    const attacker_addr = await attacker.getAddress();
    expect(await victim.balances(attacker_addr)).to.equal(0);
    expect(await victim.lockTime(attacker_addr)).to.equal(0);

    const amount = ethers.parseEther("1.0");
    const options = { value: amount };

    await attacker.deposit(options);

    expect(await victim.balances(attacker_addr)).to.equal(amount);
    let lockTime = await victim.lockTime(attacker_addr);
    expect(lockTime).to.greaterThan(0);
    const attackerBalanceBefore =
      await ethers.provider.getBalance(attacker_addr);

    expect(attackerBalanceBefore).to.equal(0);
    await attacker.attack();
    lockTime = await victim.lockTime(attacker_addr);
    expect(lockTime).to.equal(0);

    await attacker.withdraw();
    const attackerBalanceAfter =
      await ethers.provider.getBalance(attacker_addr);
    expect(attackerBalanceAfter).to.equal(amount);
  });
});
