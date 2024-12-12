const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack denial_of_service/auction.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/denial_of_service/auction.sol/DosAuction.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const DosAuction = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await DosAuction.deploy();
    await victim.waitForDeployment();

    const DosAuctionAttacker = await ethers.getContractFactory(
      "contracts/denial_of_service/auction_attack.sol:DosAuctionAttacker",
    );
    const attacker = await DosAuctionAttacker.deploy(victim.target);
    await attacker.waitForDeployment();

    return { victim, attacker };
  }

  it("sanity check: denial_of_service/auction.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    const [v, a, b] = await ethers.getSigners();
    const amount = ethers.parseEther("1");
    await expect(victim.connect(a).bid({ value: amount })).to.not.be.reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(amount);

    const balanceBefore = await ethers.provider.getBalance(a.address);
    await expect(victim.connect(b).bid({ value: amount + amount })).to.not.be
      .reverted;
    expect(await ethers.provider.getBalance(victim.target)).to.equal(
      amount + amount,
    );
    expect(await ethers.provider.getBalance(a.address)).to.equal(
      balanceBefore + amount,
    );
  });

  it("exploit denial of service vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);

    const [v, a] = await ethers.getSigners();
    const amount = 1;
    await attacker.connect(a).attack({ value: amount });

    const victimBalance = await ethers.provider.getBalance(victim.target);
    expect(victimBalance).to.equal(amount);

    // any other user bid will be reverted
    await expect(victim.connect(v).bid({ value: 2 })).to.be.reverted;

    const victimBalanceAfter = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceAfter).to.equal(amount);
  });
});
