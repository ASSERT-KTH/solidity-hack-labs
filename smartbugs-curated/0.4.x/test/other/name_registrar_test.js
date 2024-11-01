const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack other/name_registrar.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/other/name_registrar.sol/NameRegistrar.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const NameRegistrar = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await NameRegistrar.deploy();
    await victim.waitForDeployment();
    const address = await victim.getAddress();

    const NameRegistrarAttacker = await ethers.getContractFactory(
      "contracts/other/name_registrar_attack.sol:NameRegistrarAttacker",
    );
    const attacker = await NameRegistrarAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { victim, attacker };
  }

  it("sanity check: other/name_registrar.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const unlocked = await victim.unlocked();
    expect(unlocked).to.be.false;
  });

  it("exploit uninitialized storage vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);

    const unlocked = await victim.unlocked();
    expect(unlocked).to.be.false;

    await attacker.attack();

    const unlockedAfter = await victim.unlocked();
    expect(unlockedAfter).to.be.true;
  });
});
