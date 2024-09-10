const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/unchecked_return_value.sol", function () {

  async function deployContracts() {
    const ReturnValue = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/unchecked_return_value.sol:ReturnValue");
    const contract = await ReturnValue.deploy();

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

    // Ensure callchecked reverts on failure
    await expect(contract.callchecked(revertContract.target)).to.be.reverted;
    // This call does not revert, even though the malicious contract fails
    await expect(contract.callnotchecked(revertContract.target)).to.not.be.reverted;

  });
});