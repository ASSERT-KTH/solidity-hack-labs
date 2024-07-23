const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack access_control/multiowned_vulnerable.sol', function () {
    async function deployContracts() {
      const TestContract = await ethers.getContractFactory('contracts/dataset/access_control/multiowned_vulnerable.sol:TestContract');
      const victim = await TestContract.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const TestContractAttacker = await ethers.getContractFactory('contracts/access_control/multiowned_vulnerable_attack.sol:TestContractAttacker');
      const attacker = await TestContractAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const [v] = await ethers.getSigners();
      const victim_addr = await victim.getAddress();
      const attacker_addr = await attacker.getAddress();
      const amount = ethers.parseEther("1.0");
      await v.sendTransaction({
        to: victim_addr,
        value: amount,
      });
      const victimBalanceBefore = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceBefore).to.equal(amount);
      const attackerBalanceBefore = await ethers.provider.getBalance(attacker_addr);
      expect(attackerBalanceBefore).to.equal(0);
      await expect(attacker.test()).to.be.reverted;
      
      await attacker.attack();
      await expect(attacker.test()).to.not.be.reverted;
      const victimBalanceAfter = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceAfter).to.equal(0);
      const attackerBalanceAfter = await ethers.provider.getBalance(attacker_addr);
      expect(attackerBalanceAfter).to.equal(amount);
    });
  });