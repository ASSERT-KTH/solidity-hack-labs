const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack arithmetic/tokensalechallenge.sol", function () {
  async function deployContracts() {
    const TokenSaleChallengeAttacker = await ethers.getContractFactory(
      "contracts/arithmetic/tokensalechallenge_attack.sol:TokenSaleChallengeAttacker",
    );
    const attacker = await TokenSaleChallengeAttacker.deploy();
    await attacker.waitForDeployment();
    const address = await attacker.getAddress();

    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/arithmetic/tokensalechallenge.sol/TokenSaleChallenge.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const TokenSaleChallenge = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await TokenSaleChallenge.deploy(address, {
      value: ethers.parseEther("1"),
    });
    await victim.waitForDeployment();

    return { victim, attacker };
  }

  it("sanity check: arithmetic/tokensalechallenge.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [sig] = await ethers.getSigners();
    await expect(victim.connect(sig).buy(1, { value: ethers.parseEther("1") }))
      .to.not.be.reverted;
    expect(await victim.balanceOf(sig.address)).to.equal(1);
    await expect(victim.connect(sig).sell(1)).to.not.be.reverted;
    expect(await victim.balanceOf(sig.address)).to.equal(0);
  });

  it("exploit buy overflow vulnerability line 23", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);
    const victim_addr = await victim.getAddress();
    const attacker_addr = await attacker.getAddress();

    expect(await victim.balanceOf(attacker_addr)).to.equal(0);
    const options = { value: 0 };
    await attacker.attack_buy(victim_addr, options);
    expect(await victim.balanceOf(attacker_addr)).to.greaterThan(0);
  });

  it("exploit the catch the ether vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);
    const victim_addr = await victim.getAddress();
    const attacker_addr = await attacker.getAddress();

    expect(await victim.balanceOf(attacker_addr)).to.equal(0);
    const options = { value: 0 };
    await attacker.attack_complete(victim_addr, options);
    expect(await victim.isComplete()).to.be.true;
  });
});
