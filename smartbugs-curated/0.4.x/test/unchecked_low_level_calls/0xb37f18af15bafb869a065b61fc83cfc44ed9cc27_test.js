const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0xb37f18af15bafb869a065b61fc83cfc44ed9cc27.sol", function () {

  let owner;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const SimpleWallet = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0xb37f18af15bafb869a065b61fc83cfc44ed9cc27.sol:SimpleWallet");
    const contract = await SimpleWallet.connect(owner).deploy();

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

    await owner.sendTransaction({
      to: contract.target,
      value: amount,
    });
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(amount);
    await expect(contract.connect(owner).sendMoney(revertContract.target, amount)).to.not.be.reverted;

    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(amount);

    expect(await ethers.provider.getBalance(revertContract.target)).to.be.equal(0);

  });
});
