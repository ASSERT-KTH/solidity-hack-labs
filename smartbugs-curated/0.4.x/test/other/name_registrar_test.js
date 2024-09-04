const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack other/name_registrar.sol', function () {
    async function deployContracts() {
      const NameRegistrar = await ethers.getContractFactory('contracts/dataset/other/name_registrar.sol:NameRegistrar');
      const victim = await NameRegistrar.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const NameRegistrarAttacker = await ethers.getContractFactory('contracts/other/name_registrar_attack.sol:NameRegistrarAttacker');
      const attacker = await NameRegistrarAttacker.deploy(address);
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit uninitialized storage vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);

      const unlocked = await victim.unlocked();
      expect(unlocked).to.be.false;

      await attacker.attack();

      const unlockedAfter = await victim.unlocked();
      expect(unlockedAfter).to.be.true;
        
    });
  });