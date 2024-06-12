const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/integer_overflow_minimal.sol', function () {
    async function deployContracts() {
      const IntegerOverflowAdd = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_minimal.sol:IntegerOverflowMinimal');
      const victim = await IntegerOverflowAdd.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const IntegerOverflowMinimalAttacker = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_minimal_attack.sol:IntegerOverflowMinimalAttacker');
      const attacker = await IntegerOverflowMinimalAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit underflow vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await victim.run(1);
      expect(await victim.count()).to.equal(0);
      await attacker.attack();
      expect(await victim.count()).to.greaterThan(0);
    });
  });