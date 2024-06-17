const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/integer_overflow_mul.sol', function () {
    async function deployContracts() {
      const IntegerOverflowMul = await ethers.getContractFactory('contracts/dataset/arithmetic/integer_overflow_mul.sol:IntegerOverflowMul');
      const overflow = await IntegerOverflowMul.deploy();  
      await overflow.waitForDeployment();
      const address = await overflow.getAddress();

      const IntegerOverflowMulAttacker = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_mul_attack.sol:IntegerOverflowMulAttacker');
      const attacker = await IntegerOverflowMulAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {overflow, attacker};
    }

  
    it('exploit overflow vulnerability', async function () {
      const {overflow, attacker} = await loadFixture(deployContracts);
      expect(await overflow.count()).to.equal(2);
      await attacker.attack();
      expect(await overflow.count()).to.equal(0);
    });
  });