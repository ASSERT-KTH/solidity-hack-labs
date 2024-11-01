const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for modifier_reentrancy.sol", function () {
  let ModifierEntrancy;
  let victim;
  let contract;
  let MaliciousContract;
  let hacker;

  beforeEach(async function () {
    // Deploy Log contract

    // Deploy ModifierEntrancy contract with Log address
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/modifier_reentrancy.sol/ModifierEntrancy.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    ModifierEntrancy = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await ModifierEntrancy.deploy();
    await victim.waitForDeployment();

    const Bank = await ethers.getContractFactory(
      "contracts/reentrancy/modifier_reentrancy_benign.sol:BankBenign",
    );
    contract = await Bank.deploy(victim.target);

    // Deploy MaliciousContract with ModifierEntrancy address
    MaliciousContract = await ethers.getContractFactory(
      "contracts/reentrancy/modifier_reentrancy_attack.sol:MaliciousContract",
    );
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("sanity check: reentrancy/modifier_reentrancy.sol", async function () {
    await expect(contract.airDrop()).to.not.be.reverted;
    expect(await victim.tokenBalance(contract.target)).to.equal("20");
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Set hacker balance to 0
    await network.provider.send("hardhat_setBalance", [hacker.target, "0x0"]);
    let hackerBalance = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalance).to.equal(0);

    let hackerBalanceOnVictim = await victim.tokenBalance(hacker.target);
    expect(hackerBalanceOnVictim).to.equal("0");

    // Perform reentrancy attack through MaliciousContract
    await hacker.initiateAttack();

    // Check balances after attack on the victim contract
    const victimBalance = await victim.tokenBalance(victim.target);
    hackerBalanceOnVictim = await victim.tokenBalance(hacker.target);

    // Verify the attack was successful

    // we verified the hacker has more than the 20 from first call
    expect(hackerBalanceOnVictim).to.be.above("20");
  });
});
