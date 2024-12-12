const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack access_control/wallet_04_confused_sign.sol", function () {
  async function deployContracts() {
    const [v] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/access_control/wallet_04_confused_sign.sol/Wallet.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const Wallet = await ethers.getContractFactory(
      "contracts/dataset/access_control/wallet_04_confused_sign.sol:Wallet",
    );
    const victim = await Wallet.connect(v).deploy();
    await victim.waitForDeployment();
    const address = await victim.getAddress();

    const WalletAttacker = await ethers.getContractFactory(
      "contracts/access_control/wallet_04_confused_sign_attack.sol:WalletAttacker",
    );
    const attacker = await WalletAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { victim, attacker };
  }

  it("sanity check: access_control/wallet_04_confused_sign.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();

    const amount = ethers.parseEther("2");
    await expect(victim.connect(a).deposit({ value: amount })).to.not.be
      .reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(amount);
    let balanceBefore = await ethers.provider.getBalance(a.address);

    const oneEther = ethers.parseEther("1");
    let tx = await victim.connect(a).withdraw(amount);
    let receipt = await tx.wait();
    let gasFee = receipt.gasUsed * receipt.gasPrice;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(0);
    expect(await ethers.provider.getBalance(a.address)).to.equal(
      balanceBefore - gasFee + amount,
    );

    await expect(victim.connect(a).deposit({ value: oneEther })).to.not.be
      .reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(oneEther);

    balanceBefore = await ethers.provider.getBalance(v.address);
    tx = await victim.connect(v).migrateTo(v.address);
    receipt = await tx.wait();
    gasFee = receipt.gasUsed * receipt.gasPrice;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(0);
    expect(await ethers.provider.getBalance(v.address)).to.equal(
      balanceBefore - gasFee + oneEther,
    );
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

    await attacker.attack();

    const victimBalanceAfter = await ethers.provider.getBalance(victim_addr);
    expect(victimBalanceAfter).to.equal(0);
    const attackerBalanceAfter =
      await ethers.provider.getBalance(attacker_addr);
    expect(attackerBalanceAfter).to.equal(amount);
  });
});
