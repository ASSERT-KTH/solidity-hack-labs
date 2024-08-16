const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack access_control/wallet_04_confused_sign.sol', function () {
    async function deployContracts() {
      const Wallet = await ethers.getContractFactory('contracts/dataset/access_control/wallet_04_confused_sign.sol:Wallet');
      const victim = await Wallet.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const WalletAttacker = await ethers.getContractFactory('contracts/access_control/wallet_04_confused_sign_attack.sol:WalletAttacker');
      const attacker = await WalletAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const [v, a] = await ethers.getSigners();
      const victim_addr = await victim.getAddress();
      const attacker_addr = await attacker.getAddress();
      const amount = ethers.parseEther("1.0");

      await victim.connect(v).deposit({value: amount});

      const victimBalanceBefore = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceBefore).to.equal(amount);
      const attackerBalanceBefore = await ethers.provider.getBalance(attacker_addr);
      expect(attackerBalanceBefore).to.equal(0);

      await attacker.attack();
      
      const victimBalanceAfter = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceAfter).to.equal(0);
      const attackerBalanceAfter = await ethers.provider.getBalance(attacker_addr);
      expect(attackerBalanceAfter).to.equal(amount);
    });
  });