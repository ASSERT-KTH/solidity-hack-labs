const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack arithmetic/overflow_simple_add.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/arithmetic/overflow_simple_add.sol/Overflow_Add.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const Overflow_Add = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const overflow = await Overflow_Add.deploy();
    await overflow.waitForDeployment();
    const address = await overflow.getAddress();

    const OverflowAddAttacker = await ethers.getContractFactory(
      "contracts/arithmetic/overflow_simple_add_attack.sol:OverflowAddAttacker",
    );
    const attacker = await OverflowAddAttacker.deploy(address);
    await attacker.waitForDeployment();
    return { overflow, attacker };
  }

  it("sanity check: arithmetic/overflow_simple_add.sol", async function () {
    const { overflow } = await loadFixture(deployContracts);
    expect(await overflow.balance()).to.equal(1);
    await overflow.add(1);
    expect(await overflow.balance()).to.equal(2);
  });

  it("exploit overflow vulnerability", async function () {
    const { overflow, attacker } = await loadFixture(deployContracts);
    expect(await overflow.balance()).to.equal(1);
    await overflow.add(1);
    expect(await overflow.balance()).to.equal(2);
    await attacker.attack();
    expect(await overflow.balance()).to.equal(0);
  });
});
