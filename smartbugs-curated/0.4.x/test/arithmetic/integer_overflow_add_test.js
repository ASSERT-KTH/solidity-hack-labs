const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/integer_overflow_add.sol', function () {
    async function deployContracts() {
      const IntegerOverflowAdd = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_add.sol:IntegerOverflowAdd');
      const overflow = await IntegerOverflowAdd.deploy();  
      await overflow.waitForDeployment();
      const address = await overflow.getAddress();

      const IntegerOverflowAddAttacker = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_add_attack.sol:IntegerOverflowAddAttacker');
      const attacker = await IntegerOverflowAddAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {overflow, attacker};
    }

  
    it('exploit overflow vulnerability', async function () {
      const {overflow, attacker} = await loadFixture(deployContracts);
      expect(await overflow.count()).to.equal(1);
      await attacker.attack();
      expect(await overflow.count()).to.equal(0);
    });
  });