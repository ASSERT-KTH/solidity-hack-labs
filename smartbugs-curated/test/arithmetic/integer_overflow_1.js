const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/integer_overflow_1.sol', function () {
    async function deployContracts() {
      const Overflow = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_1.sol:Overflow');
      const victim = await Overflow.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const OverflowAttacker = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_1_attack.sol:OverflowAttacker');
      const attacker = await OverflowAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit overflow vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.getSellerBalance()).to.equal(0);
      await victim.add(1);
      expect(await victim.getSellerBalance()).to.equal(1);

      await attacker.attack();
      expect(await victim.getSellerBalance()).to.equal(0);
    });
  });