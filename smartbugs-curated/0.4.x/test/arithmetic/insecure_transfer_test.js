const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require("chai");

describe("attack arithmetic/insecure_transfer.sol", function () {
  let addr1;
  let addr2;
  let initialBalances;

  async function deployContracts() {
    const InsecureTransferAttacker = await ethers.getContractFactory("contracts/arithmetic/insecure_transfer_attack.sol:InsecureTransferAttacker");
    const attacker = await InsecureTransferAttacker.deploy();
    await attacker.waitForDeployment();
    
    addr2 = await attacker.getAddress();
  
    [addr1] = await ethers.getSigners();

    const initialAddresses = [addr1.address, addr2];

    const maxUint256 = BigInt(2) ** BigInt(256) - BigInt(1);
    initialBalances = [1, maxUint256];

    const IntegerOverflowAdd = await ethers.getContractFactory("contracts/arithmetic/insecure_transfer.sol:IntegerOverflowAdd");
    victim = await IntegerOverflowAdd.deploy(initialAddresses, initialBalances);
    await victim.waitForDeployment();


    return {victim, attacker};
  }

  it("exploit overflow vulnerability", async function () {
    const {victim, attacker} = await loadFixture(deployContracts);
    expect(await victim.balanceOf(addr1.address)).to.equal(initialBalances[0]);
    expect(await victim.balanceOf(addr2)).to.equal(initialBalances[1]);

    victim_address = await victim.getAddress();
    await attacker.attack(victim_address, addr1.address);

    expect(await victim.balanceOf(addr1.address)).to.equal(0);
  });
});
