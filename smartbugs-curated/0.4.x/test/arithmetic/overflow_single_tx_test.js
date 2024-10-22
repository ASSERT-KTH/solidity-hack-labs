const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack arithmetic/overflow_single_tx.sol', function () {
    async function deployContracts() {
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/arithmetic/overflow_single_tx.sol/IntegerOverflowSingleTransaction.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      const IntegerOverflowSingleTransaction = await ethers.getContractFactory(json.abi, json.bytecode);
      const victim = await IntegerOverflowSingleTransaction.deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const IntegerOverflowSingleTransactionAttacker = await ethers.getContractFactory('contracts/arithmetic/overflow_single_tx_attack.sol:IntegerOverflowSingleTransactionAttacker');
      const attacker = await IntegerOverflowSingleTransactionAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

    it('sanity check: arithmetic/overflow_single_tx.sol add', async function () {
      const {victim} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await victim.overflowaddtostate(1);
      expect(await victim.count()).to.equal(2);
    });

    it('sanity check: arithmetic/overflow_single_tx.sol mul', async function () {
      const {victim} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await victim.overflowmultostate(2);
      expect(await victim.count()).to.equal(2);
    });

    it('sanity check: arithmetic/overflow_single_tx.sol sub', async function () {
      const {victim} = await loadFixture(deployContracts);
      expect(await victim.count()).to.equal(1);
      await victim.underflowtostate(1);
      expect(await victim.count()).to.equal(0);
    });

  
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
  });