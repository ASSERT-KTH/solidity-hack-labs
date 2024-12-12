const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack unchecked_low_level_calls/0xa1fceeff3acc57d257b917e30c4df661401d6431.sol", function () {
  let owner, sig;
  async function deployContracts() {
    [owner, sig] = await ethers.getSigners();
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/unchecked_low_level_calls/0xa1fceeff3acc57d257b917e30c4df661401d6431.sol/AirDropContract.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const AirDropContract = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const contract = await AirDropContract.deploy();

    const TokenEBU = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/TokenEBU.sol:TokenEBU",
    );
    const token = await TokenEBU.connect(owner).deploy(1, "EBU", "EBU");

    const SuccessContract = await ethers.getContractFactory(
      "contracts/unchecked_low_level_calls/success_contract.sol:SuccessContract",
    );
    const success_contract = await SuccessContract.deploy();

    return { contract, token, success_contract };
  }

  it("sanity check: unchecked_low_level_calls/0xa1fceeff3acc57d257b917e30c4df661401d6431.sol", async function () {
    const { contract, success_contract } = await loadFixture(deployContracts);
    const amount = ethers.parseEther("1");
    await success_contract.connect(owner).transfer(sig.address, amount);
    await expect(
      contract
        .connect(sig)
        .transfer(success_contract.target, [contract.target], [amount]),
    ).to.not.be.reverted;
    expect(await success_contract.balanceOf(contract.target)).to.be.equal(
      amount,
    );
  });

  it("exploit unchecked low level call vulnerability", async function () {
    const { contract, token } = await loadFixture(deployContracts);

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

    // it does not revert cause the return value of call is not checked
    await expect(contract.transfer(token.target, to, val)).not.be.reverted;
    // the second transfer does not happen
    expect(await token.balanceOf(owner)).to.be.equal(amount - BigInt(10));
    expect(await token.balanceOf(contract.target)).to.be.equal(10);
    expect(await token.balanceOf(sig.address)).to.be.equal(0);
  });
});
