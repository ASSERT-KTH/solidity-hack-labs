const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0x84d9ec85c9c568eb332b7226a8f826d897e0a4a8.sol", function () {

  let owner;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const WedIndex = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x84d9ec85c9c568eb332b7226a8f826d897e0a4a8.sol:WedIndex");
    const contract = await WedIndex.connect(owner).deploy();

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

    await expect(contract.connect(owner).execute(revertContract.target, 0, "0x")).to.not.be.reverted;

    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(0);

    expect(await ethers.provider.getBalance(revertContract.target)).to.be.equal(0);

  });
});
