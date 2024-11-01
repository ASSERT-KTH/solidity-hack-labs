const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack access_control/wallet_03_wrong_constructor.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/access_control/wallet_03_wrong_constructor.sol/Wallet.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const Wallet = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await Wallet.deploy();
    await victim.waitForDeployment();
    const address = await victim.getAddress();

    const WalletAttacker = await ethers.getContractFactory(
      "contracts/access_control/wallet_03_wrong_constructor_attack.sol:WalletAttacker",
    );
    const attacker = await WalletAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { victim, attacker };
  }

  it("sanity check: access_control/wallet_03_wrong_constructor.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    await expect(victim.deposit({ value: 1 })).to.not.be.reverted;
    await expect(victim.withdraw(1)).to.not.be.reverted;
  });

  it("exploit access control vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();
    const victim_addr = await victim.getAddress();
    const attacker_addr = await attacker.getAddress();
    const amount = ethers.parseEther("1.0");

    await victim.connect(v).deposit({ value: amount });

    const victimBalanceBefore = await ethers.provider.getBalance(victim_addr);
    expect(victimBalanceBefore).to.equal(amount);
    const attackerBalanceBefore =
      await ethers.provider.getBalance(attacker_addr);
    expect(attackerBalanceBefore).to.equal(0);

    await expect(attacker.test()).to.be.reverted;
    await attacker.attack();
    await expect(attacker.test()).to.not.be.reverted;

    const victimBalanceAfter = await ethers.provider.getBalance(victim_addr);
    expect(victimBalanceAfter).to.equal(0);
    const attackerBalanceAfter =
      await ethers.provider.getBalance(attacker_addr);
    expect(attackerBalanceAfter).to.equal(amount);
  });
});
