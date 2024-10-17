const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack arithmetic/BECToken.sol', function () {
    async function deployContracts() {
    const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/arithmetic/BECToken.sol/BecToken.json');
    const json = JSON.parse(fs.readFileSync(codePath));

    const BECToken = await ethers.getContractFactory(json.abi, json.bytecode);
    const victim = await BECToken.deploy();  
    await victim.waitForDeployment();

    const BecTokenAttacker = await ethers.getContractFactory('contracts/arithmetic/BECToken_attack.sol:BecTokenAttacker');
    const attacker = await BecTokenAttacker.deploy();  
    await attacker.waitForDeployment();

    return {victim, attacker};
    }

  
    it('exploit overflow vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const victim_addr = await victim.getAddress();
      const attacker_addr = await attacker.getAddress();

      expect(await victim.balanceOf(attacker_addr)).to.equal(0);
      await attacker.attack(victim_addr);
      expect(await victim.balanceOf(attacker_addr)).to.greaterThan(0);
    });

  });