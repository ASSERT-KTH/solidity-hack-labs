const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack unchecked_low_level_calls/0x627fa62ccbb1c1b04ffaecd72a53e37fc0e17839.sol", function () {
  let owner, sig;
  async function deployContracts() {
    [owner, sig] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/unchecked_low_level_calls/0x627fa62ccbb1c1b04ffaecd72a53e37fc0e17839.sol/TokenBank.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const TokenBank = await ethers.getContractFactory(json.abi, json.bytecode);
    const contract = await TokenBank.connect(owner).deploy();

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

  it("sanity check: unchecked_low_level_calls/0x627fa62ccbb1c1b04ffaecd72a53e37fc0e17839.sol", async function () {
    const { contract, successContract } = await loadFixture(deployContracts);
    await expect(contract.connect(owner).initTokenBank()).to.not.be.reverted;
    const amount = ethers.parseEther("2");

    await expect(
      successContract.connect(owner).transfer(contract.target, amount),
    ).to.not.be.reverted;
    expect(await successContract.balanceOf(contract.target)).to.equal(amount);

    await expect(
      owner.sendTransaction({
        to: contract.target,
        value: amount,
      }),
    ).to.not.be.reverted;

    expect(await ethers.provider.getBalance(contract.target)).to.equal(amount);

    expect(await contract.Holders(owner.address)).to.equal(amount);

    await expect(
      contract.WitdrawTokenToHolder(
        owner.address,
        successContract.target,
        amount,
      ),
    ).to.not.be.reverted;

    expect(await contract.Holders(owner.address)).to.equal(0);

    expect(await successContract.balanceOf(owner.address)).to.equal(
      ethers.parseEther("10"),
    );
    expect(await successContract.balanceOf(successContract.target)).to.equal(0);

    await sig.sendTransaction({
      to: contract.target,
      value: amount,
    });

    expect(await ethers.provider.getBalance(contract.target)).to.equal(
      amount + amount,
    );

    expect(await contract.Holders(sig.address)).to.equal(amount);
  });

  it("exploit unchecked low level call vulnerability in WithdrawToken()", async function () {
    const { contract, revertContract } = await loadFixture(deployContracts);

    await contract.connect(owner).initTokenBank();

    const minDeposit = await contract.MinDeposit();
    const oneEther = ethers.parseEther("1");
    expect(minDeposit).to.equal(oneEther);

    await expect(
      sig.sendTransaction({
        to: revertContract.target,
        value: oneEther,
      }),
    ).to.be.revertedWith("I always revert!");

    const amount = ethers.parseEther("2");
    // Signer deposits ether to become a holder
    await sig.sendTransaction({
      to: contract.target,
      value: amount,
    });

    expect(await ethers.provider.getBalance(contract.target)).to.equal(amount);

    // Expect signer to be in Holders
    expect(await contract.Holders(sig.address)).to.equal(amount);

    // signer puts the wrong address in the withdraw function
    await contract.WitdrawTokenToHolder(
      sig.address,
      revertContract.target,
      amount,
    );

    //signer no longer holds tokens
    expect(await contract.Holders(sig.address)).to.equal(0);

    const revertBalance = await ethers.provider.getBalance(
      revertContract.target,
    );
    // the wrong contract doesn't get the ether
    expect(revertBalance).to.equal(0);

    // the contract still holds the ether
    expect(await ethers.provider.getBalance(contract.target)).to.equal(amount);
  });
});
