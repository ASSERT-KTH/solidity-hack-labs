const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");


describe('attack access_control/mapping_write.sol', function () {
    async function deployContracts() {
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/access_control/mapping_write.sol/Map.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      
      const Map = await ethers.getContractFactory(json.abi, json.bytecode);
      const victim = await Map.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const MapAttacker = await ethers.getContractFactory('contracts/access_control/mapping_write_attack.sol:MapAttacker');
      const attacker = await MapAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

    it('sanity check: access_control/mapping_write.sol', async function () {
      const {victim} = await loadFixture(deployContracts);
      await expect(victim.set(1, 1)).to.not.be.reverted;
      expect(await victim.get(1)).to.equal(1);
    });

  
    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      await expect(attacker.withdraw_from_victim()).to.be.reverted;
      await attacker.attack(attacker.getAddress());
      await attacker.withdraw_from_victim();
    });
  });