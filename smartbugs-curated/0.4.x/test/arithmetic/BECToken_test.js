const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack arithmetic/BECToken.sol", function () {
  let owner;
  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/arithmetic/BECToken.sol/BecToken.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));

    const BECToken = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await BECToken.connect(owner).deploy();
    await victim.waitForDeployment();

    const BecTokenAttacker = await ethers.getContractFactory(
      "contracts/arithmetic/BECToken_attack.sol:BecTokenAttacker",
    );
    const attacker = await BecTokenAttacker.deploy();
    await attacker.waitForDeployment();

    return { victim, attacker };
  }

  it("sanity check: arithmetic/BECToken.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const balance = await victim.balanceOf(victim.target);
    expect(balance).to.equal(0);
    const ownerBalance = await victim.balanceOf(await owner.address);
    expect(ownerBalance).to.equal(await victim.totalSupply());
    await victim.batchTransfer([victim.target], 10);
    const newBalance = await victim.balanceOf(victim.target);
    expect(newBalance).to.equal(10);
    const newOwnerBalance = await victim.balanceOf(await owner.address);
    expect(newOwnerBalance).to.equal(ownerBalance - newBalance);
  });

  it("exploit overflow vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);
    const victim_addr = await victim.getAddress();
    const attacker_addr = await attacker.getAddress();

    expect(await victim.balanceOf(attacker_addr)).to.equal(0);
    await attacker.attack(victim_addr);
    expect(await victim.balanceOf(attacker_addr)).to.greaterThan(0);
  });
});
