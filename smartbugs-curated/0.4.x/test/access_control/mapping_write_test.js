const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack access_control/mapping_write.sol', function () {
    async function deployContracts() {
      const Map = await ethers.getContractFactory('contracts/dataset/access_control/mapping_write.sol:Map');
      const victim = await Map.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const MapAttacker = await ethers.getContractFactory('contracts/access_control/mapping_write_attack.sol:MapAttacker');
      const attacker = await MapAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      await expect(attacker.withdraw_from_victim()).to.be.reverted;
      await attacker.attack(attacker.getAddress());
      await attacker.withdraw_from_victim();
    });
  });