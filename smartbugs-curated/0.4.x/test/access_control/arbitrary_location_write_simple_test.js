const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack access_control/arbitrary_location_write_simple.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/access_control/arbitrary_location_write_simple.sol/Wallet.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));

    const Wallet = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await Wallet.deploy();
    await victim.waitForDeployment();
    const address = await victim.getAddress();

    const WalletAttacker = await ethers.getContractFactory(
      "contracts/access_control/arbitrary_location_write_simple_attack.sol:WalletAttacker",
    );
    const attacker = await WalletAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { victim, attacker };
  }

  it("sanity check: access_control/arbitrary_location_write_simple.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();
    await expect(victim.connect(a).PushBonusCode(1)).to.not.be.reverted;
    await expect(victim.connect(a).PopBonusCode()).to.not.be.reverted;
  });

  it("exploit access control vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);
    await expect(attacker.test()).to.be.reverted;
    await attacker.attack(await attacker.getAddress());
    await attacker.test();
  });
});
