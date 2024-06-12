const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/integer_overflow_multitx_onefunc_feasible.sol', function () {
    async function deployContracts() {
      const IntegerOverflowMultiTxMultiFuncFeasible = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_multitx_onefunc_feasible.sol:IntegerOverflowMultiTxOneFuncFeasible');
      const victim = await IntegerOverflowMultiTxMultiFuncFeasible.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const IntegerOverflowMultiTxMultiFuncFeasibleAttacker = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_multitx_onefunc_feasible_attack.sol:IntegerOverflowMultiTxOneFuncFeasibleAttacker');
      const attacker = await IntegerOverflowMultiTxMultiFuncFeasibleAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit underflow vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await attacker.attack();
      expect(await victim.count()).to.greaterThan(1);
    });
  });