const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack denial_of_service/dos_simple.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/denial_of_service/dos_simple.sol/DosOneFunc.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const DosOneFunc = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await DosOneFunc.deploy();
    await victim.waitForDeployment();

    const DosOneFuncAttacker = await ethers.getContractFactory(
      "contracts/denial_of_service/dos_simple_attack.sol:DosOneFuncAttacker",
    );
    const attacker = await DosOneFuncAttacker.deploy(victim.target);
    await attacker.waitForDeployment();

    return { victim, attacker };
  }

  it("sanity check: denial_of_service/dos_simple.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    await expect(victim.ifillArray()).to.not.be.reverted;
  });

  it("exploit denial of service vulnerability", async function () {
    const { victim, attacker } = await loadFixture(deployContracts);

    await network.provider.send("evm_setAutomine", [false]);
    await network.provider.send("evm_setIntervalMining", [0]);

    const tx1 = await attacker.attack();
    const tx2 = await victim.ifillArray();

    await network.provider.send("evm_mine");
    await network.provider.send("evm_setAutomine", [true]);

    const receipt1 = await (await tx1).wait();
    expect(receipt1.status).to.equal(1); // Ensure tx1 was successful

    const tx2Receipt = await ethers.provider.getTransactionReceipt(tx2.hash);
    expect(tx2Receipt).to.be.null; // Ensure tx2 was not included in the block due to out of gas error
  });
});
