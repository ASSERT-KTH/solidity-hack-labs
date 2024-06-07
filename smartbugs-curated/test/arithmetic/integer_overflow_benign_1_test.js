const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/integer_overflow_benign_1.sol', function () {
    async function deployContracts() {
      const IntegerOverflowAdd = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_benign_1.sol:IntegerOverflowBenign1');
      const overflow = await IntegerOverflowAdd.deploy();  
      await overflow.waitForDeployment();
      const address = await overflow.getAddress();

      const IntegerOverflowBenign1Attacker = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_benign_1_attack.sol:IntegerOverflowBenign1Attacker');
      const attacker = await IntegerOverflowBenign1Attacker.deploy(address);  
      await attacker.waitForDeployment();
      return {overflow, attacker};
    }

  
    it('exploit overflow vulnerability', async function () {
      const {overflow, attacker} = await loadFixture(deployContracts);
      expect(await overflow.count()).to.equal(1);
      await attacker.attack();
      expect(await overflow.count()).to.greaterThan(0);
    });
  });