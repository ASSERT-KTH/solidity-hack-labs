const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack bad_randomness/guess_the_random_number.sol", function () {
  let amount;
  async function deployContracts() {
    const [v, a] = await ethers.getSigners();
    amount = ethers.parseEther("1");

    const options = {
      from: v,
      value: amount,
    };

    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/bad_randomness/guess_the_random_number.sol/GuessTheRandomNumberChallenge.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const GuessTheRandomNumberChallenge = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await GuessTheRandomNumberChallenge.deploy(options);

    const tx = await victim.deploymentTransaction().wait();
    const block = await ethers.provider.getBlock(tx.blockNumber);

    const GuessTheRandomNumberChallengeAttacker =
      await ethers.getContractFactory(
        "contracts/bad_randomness/guess_the_random_number_attack.sol:GuessTheRandomNumberChallengeAttacker",
      );
    const attacker = await GuessTheRandomNumberChallengeAttacker.deploy(
      victim.target,
    );
    await attacker.waitForDeployment();

    await a.sendTransaction({
      to: attacker.target,
      value: amount,
    });

    return { block, victim, attacker };
  }

  it("sanity check: bad_randomness/guess_the_random_number.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();
    await expect(victim.connect(a).guess(42, { value: ethers.parseEther("1") }))
      .to.not.be.reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.be.equal(
      ethers.parseEther("2"),
    );
  });

  it("exploit bad randomness vulnerability", async function () {
    const { block, victim, attacker } = await loadFixture(deployContracts);

    const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceBefore).to.equal(amount);

    const attackerBalanceBefore = await ethers.provider.getBalance(
      attacker.target,
    );
    expect(attackerBalanceBefore).to.equal(amount);

    await attacker.attack(block.number, block.timestamp);

    const victimBalanceAfter = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceAfter).to.equal(0);

    const attackerBalanceAfter = await ethers.provider.getBalance(
      attacker.target,
    );
    expect(attackerBalanceAfter).to.equal(amount + amount);
  });
});
