const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack arithmetic/integer_overflow_mul.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/arithmetic/integer_overflow_mul.sol/IntegerOverflowMul.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const IntegerOverflowMul = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const overflow = await IntegerOverflowMul.deploy();
    await overflow.waitForDeployment();
    const address = await overflow.getAddress();

    const IntegerOverflowMulAttacker = await ethers.getContractFactory(
      "contracts/arithmetic/integer_overflow_mul_attack.sol:IntegerOverflowMulAttacker",
    );
    const attacker = await IntegerOverflowMulAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { overflow, attacker };
  }

  it("sanity check: arithmetic/integer_overflow_mul.sol", async function () {
    const { overflow } = await loadFixture(deployContracts);
    expect(await overflow.count()).to.equal(2);
    await overflow.run(2);
    expect(await overflow.count()).to.equal(4);
  });

  it("exploit overflow vulnerability", async function () {
    const { overflow, attacker } = await loadFixture(deployContracts);
    expect(await overflow.count()).to.equal(2);
    await attacker.attack();
    expect(await overflow.count()).to.equal(0);
  });
});
