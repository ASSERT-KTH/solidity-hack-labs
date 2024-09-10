const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0x7a4349a749e59a5736efb7826ee3496a2dfd5489.sol", function () {

  let onwer;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const WhaleGiveaway1 = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x7a4349a749e59a5736efb7826ee3496a2dfd5489.sol:WhaleGiveaway1");
    const contract = await WhaleGiveaway1.connect(owner).deploy();

    const RevertContract = await ethers.getContractFactory("contracts/unchecked_low_level_calls/revert_contract.sol:RevertContract");
    const revertContract = await RevertContract.deploy();

    return {contract, revertContract}
  };

  it("exploit unchecked low level call vulnerability", async function () {
    const {contract, revertContract} = await loadFixture(deployContracts);
    const amount = ethers.parseEther("1");
    await expect(
      owner.sendTransaction({
        to: revertContract.target,
        value: amount,
      })
    ).to.be.revertedWith("I always revert!");

    await expect(contract.connect(owner).Command(revertContract.target, "0x", {value: amount})).to.not.be.reverted;

    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(amount);

    expect(await ethers.provider.getBalance(revertContract.target)).to.be.equal(0);

  });
});
