const {
  loadFixture,
  time,
  mine,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack time_manipulation/timed_crowdsale.sol", function () {
  async function deployContracts() {
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/time_manipulation/timed_crowdsale.sol/TimedCrowdsale.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const TimedCrowdsale = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
    );
    const victim = await TimedCrowdsale.deploy();

    return { victim };
  }

  it("sanity check: time_manipulation/timed_crowdsale.sol", async function () {
    await hre.network.provider.send("hardhat_reset");
    const { victim } = await deployContracts();
    const [v, a] = await ethers.getSigners();
    const saleFinished = await victim.connect(a).isSaleFinished();
    expect(saleFinished).to.be.false;
  });

  it("exploit time manipulation vulnerability", async function () {
    await hre.network.provider.send("hardhat_reset");
    const { victim } = await loadFixture(deployContracts);

    const saleEndTimestamp = 1546300800;

    // Fast forward time to January 1, 2019 (just after sale end)
    await time.setNextBlockTimestamp(saleEndTimestamp);
    await mine(1);

    // The sale should now be finished due to the time manipulation
    const saleFinished = await victim.isSaleFinished();
    expect(saleFinished).to.be.true;
  });
});
