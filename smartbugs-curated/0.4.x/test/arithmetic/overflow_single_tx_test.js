const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/overflow_single_tx.sol', function () {
    async function deployContracts() {
      const IntegerOverflowSingleTransaction = await ethers.getContractFactory('contracts/arithmetic/overflow_single_tx.sol:IntegerOverflowSingleTransaction');
      const victim = await IntegerOverflowSingleTransaction.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const IntegerOverflowSingleTransactionAttacker = await ethers.getContractFactory('contracts/arithmetic/overflow_single_tx_attack.sol:IntegerOverflowSingleTransactionAttacker');
      const attacker = await IntegerOverflowSingleTransactionAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit overflow add vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await attacker.attackOverflowAddToState();
      expect(await victim.count()).to.equal(0);
    });

      
    it('exploit overflow mul vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await attacker.attackOverflowMulToState();
      expect(await victim.count()).to.equal(0);
    });

    it('exploit underflow vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await attacker.attackUnderflowToState();
      expect(await victim.count()).to.greaterThan(1);
    });

    it('exploit overflow add vulnerability locally', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await attacker.attackOverflowAddLocalOnly();
      expect(await victim.count()).to.equal(1);
    });

      
    it('exploit overflow mul vulnerability locally', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await attacker.attackOverflowMulLocalOnly();
      expect(await victim.count()).to.equal(1);
    });

    it('exploit underflow vulnerability locally', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await attacker.attackUnderflowLocalOnly();
      expect(await victim.count()).to.equal(1);
    });

  });