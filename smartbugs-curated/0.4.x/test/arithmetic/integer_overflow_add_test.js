const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack arithmetic/integer_overflow_add.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/arithmetic/integer_overflow_add.sol/IntegerOverflowAdd.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const IntegerOverflowAdd = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const overflow = await IntegerOverflowAdd.deploy();
    await overflow.waitForDeployment();
    const address = await overflow.getAddress();

    const IntegerOverflowAddAttacker = await ethers.getContractFactory(
      "contracts/arithmetic/integer_overflow_add_attack.sol:IntegerOverflowAddAttacker",
    );
    const attacker = await IntegerOverflowAddAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { overflow, attacker };
  }

  it("sanity check: arithmetic/integer_overflow_add.sol", async function () {
    const { overflow } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();
    expect(await overflow.count()).to.equal(1);
    await overflow.connect(a).run(1);
    expect(await overflow.count()).to.equal(2);
  });

  it("exploit overflow vulnerability", async function () {
    const { overflow, attacker } = await loadFixture(deployContracts);
    expect(await overflow.count()).to.equal(1);
    await attacker.attack();
    expect(await overflow.count()).to.equal(0);
  });
});
