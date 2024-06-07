const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/integer_overflow_minimal.sol', function () {
    async function deployContracts() {
      const IntegerOverflowAdd = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_minimal.sol:IntegerOverflowMinimal');
      const overflow = await IntegerOverflowAdd.deploy();  
      await overflow.waitForDeployment();
      const address = await overflow.getAddress();

      const IntegerOverflowMinimalAttacker = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_minimal_attack.sol:IntegerOverflowMinimalAttacker');
      const attacker = await IntegerOverflowMinimalAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {overflow, attacker};
    }

  
    it('exploit overflow vulnerability', async function () {
      const {overflow, attacker} = await loadFixture(deployContracts);
      expect(await overflow.count()).to.equal(1);
      await overflow.run(1);
      expect(await overflow.count()).to.equal(0);
      await attacker.attack();
      expect(await overflow.count()).to.greaterThan(0);
    });
  });