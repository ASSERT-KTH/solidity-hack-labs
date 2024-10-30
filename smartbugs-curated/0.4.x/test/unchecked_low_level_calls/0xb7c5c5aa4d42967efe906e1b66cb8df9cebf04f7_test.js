const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe("attack unchecked_low_level_calls/0xb7c5c5aa4d42967efe906e1b66cb8df9cebf04f7.sol", function () {

  let owner;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/unchecked_low_level_calls/0xb7c5c5aa4d42967efe906e1b66cb8df9cebf04f7.sol/keepMyEther.json');
    const json = JSON.parse(fs.readFileSync(codePath));
    const keepMyEther = await ethers.getContractFactory(json.abi, json.bytecode);
    const contract = await keepMyEther.connect(owner).deploy();

    const RevertContract = await ethers.getContractFactory("contracts/unchecked_low_level_calls/revert_contract.sol:RevertContract");
    const revertContract = await RevertContract.deploy();

    const SuccessContract = await ethers.getContractFactory("contracts/unchecked_low_level_calls/success_contract.sol:SuccessContract");
    const successContract = await SuccessContract.deploy();

    return {contract, revertContract, successContract}
  };

  it('sanity check: unchecked_low_level_calls/0xb7c5c5aa4d42967efe906e1b66cb8df9cebf04f7.sol', async function () {
    const {contract, successContract} = await loadFixture(deployContracts);
    const amount = ethers.parseEther("1");
    await expect(successContract.sendEther(contract.target, {value: amount})).not.be.reverted;
    expect(await contract.balances(successContract.target)).to.be.equal(amount);
    expect(await ethers.provider.getBalance(successContract.target)).to.be.equal(0);
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(amount);

    await expect(successContract.withdrawEther(contract.target)).to.not.be.reverted;
    expect(await contract.balances(successContract.target)).to.be.equal(0);
    expect(await ethers.provider.getBalance(successContract.target)).to.be.equal(amount);
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(0);
  });

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
