const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack access_control/unprotected0.sol", function () {
  let owner;
  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/access_control/unprotected0.sol/Unprotected.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const Unprotected = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await Unprotected.connect(owner).deploy();
    await victim.waitForDeployment();
    const address = await victim.getAddress();

    const UnprotectedAttacker = await ethers.getContractFactory(
      "contracts/access_control/unprotected0_attack.sol:UnprotectedAttacker",
    );
    const attacker = await UnprotectedAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { victim, attacker };
  }

  it("sanity check: access_control/unprotected0.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    await expect(victim.connect(owner).changeOwner(owner)).to.not.be.reverted;
  });

  it("exploit access control vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);

    await expect(attacker.attack(await attacker.getAddress())).to.not.be
      .reverted;
  });
});
