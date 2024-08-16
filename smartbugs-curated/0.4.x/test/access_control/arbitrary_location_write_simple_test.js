const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack access_control/arbitrary_location_write_simple.sol', function () {
    async function deployContracts() {
      const Wallet = await ethers.getContractFactory('contracts/dataset/access_control/arbitrary_location_write_simple.sol:Wallet');
      const victim = await Wallet.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const WalletAttacker = await ethers.getContractFactory('contracts/access_control/arbitrary_location_write_simple_attack.sol:WalletAttacker');
      const attacker = await WalletAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      await expect(attacker.test()).to.be.reverted;
      await attacker.attack(await attacker.getAddress());
      await attacker.test();
    });
  });