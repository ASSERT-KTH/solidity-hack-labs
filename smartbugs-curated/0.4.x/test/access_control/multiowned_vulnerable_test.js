const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack access_control/multiowned_vulnerable.sol", function () {
  let owner;
  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/access_control/multiowned_vulnerable.sol/TestContract.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const TestContract = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await TestContract.connect(owner).deploy();
    await victim.waitForDeployment();
    const address = await victim.getAddress();

    const TestContractAttacker = await ethers.getContractFactory(
      "contracts/access_control/multiowned_vulnerable_attack.sol:TestContractAttacker",
    );
    const attacker = await TestContractAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { victim, attacker };
  }

  it("sanity check: access_control/multiowned_vulnerable.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [v, a, b] = await ethers.getSigners();
    await expect(victim.connect(owner).newOwner(a.address)).to.not.be.reverted;
    expect(await victim.owners(a.address)).to.equal(owner.address);

    await expect(victim.connect(owner).deleteOwner(a.address)).to.not.be
      .reverted;
    expect(Number(await victim.owners(a.address))).to.equal(0);

    const amount = ethers.parseEther("1.0");
    await b.sendTransaction({
      to: victim.target,
      value: amount,
    });
    expect(await ethers.provider.getBalance(victim.target)).to.equal(amount);
    const balanceBefore = await ethers.provider.getBalance(owner.address);
    const tx = await victim.connect(owner).withdrawAll();
    const receipt = await tx.wait();
    const gasFee = receipt.gasUsed * receipt.gasPrice;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(0);
    expect(await ethers.provider.getBalance(owner.address)).to.equal(
      balanceBefore - gasFee + amount,
    );
  });

  it("exploit access control vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);
    const victim_addr = await victim.getAddress();
    const attacker_addr = await attacker.getAddress();
    const amount = ethers.parseEther("1.0");
    await owner.sendTransaction({
      to: victim_addr,
      value: amount,
    });
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
