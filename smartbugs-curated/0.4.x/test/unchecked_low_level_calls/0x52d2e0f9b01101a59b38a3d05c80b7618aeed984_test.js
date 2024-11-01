const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack unchecked_low_level_calls/0x52d2e0f9b01101a59b38a3d05c80b7618aeed984.sol", function () {
  let owner;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/unchecked_low_level_calls/0x52d2e0f9b01101a59b38a3d05c80b7618aeed984.sol/EtherGet.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const EtherGet = await ethers.getContractFactory(json.abi, json.bytecode);
    const contract = await EtherGet.connect(owner).deploy();

    const RevertContract = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/revert_contract.sol:RevertContract",
    );
    const revertContract = await RevertContract.deploy();

    const SuccessContract = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/success_contract.sol:SuccessContract",
    );
    const successContract = await SuccessContract.connect(owner).deploy();

    return { contract, revertContract, successContract };
  }

  it("sanity check: unchecked_low_level_calls/0x52d2e0f9b01101a59b38a3d05c80b7618aeed984.sol", async function () {
    const { contract, successContract } = await loadFixture(deployContracts);
    await expect(contract.connect(owner).getTokens(2, successContract.target))
      .to.not.be.reverted;
  });

  it("exploit unchecked low level call vulnerability", async function () {
    const { contract, revertContract } = await loadFixture(deployContracts);
    const amount = ethers.parseEther("1");
    await expect(
      owner.sendTransaction({
        to: revertContract.target,
        value: amount,
      }),
    ).to.be.revertedWith("I always revert!");

    await expect(contract.connect(owner).getTokens(2, revertContract.target)).to
      .not.be.reverted;
  });
});
