const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack arithmetic/integer_overflow_1.sol', function () {
    async function deployContracts() {
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/arithmetic/integer_overflow_1.sol/Overflow.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      const Overflow = await ethers.getContractFactory(json.abi, json.bytecode);
      const overflow = await Overflow.deploy();  
      await overflow.waitForDeployment();
      const address = await overflow.getAddress();

      const OverflowAttacker = await ethers.getContractFactory('contracts/arithmetic/integer_overflow_1_attack.sol:OverflowAttacker');
      const attacker = await OverflowAttacker.deploy(address);
      await attacker.waitForDeployment();
      
      return {overflow, attacker};
    }

    it('sanity check: arithmetic/integer_overflow_1.sol', async function () {
        const {overflow} = await loadFixture(deployContracts);
        let storage = await ethers.provider.getStorage(overflow.target, 0);
        let value = Number(storage);
        expect(value).to.be.equal(0);
        await overflow.add(1);
        storage = await ethers.provider.getStorage(overflow.target, 0);
        value = Number(storage);
        expect(value).to.be.equal(1);
    });
  
    it('exploit overflow vulnerability', async function () {
      const {overflow,attacker} = await loadFixture(deployContracts);
      let storage = await ethers.provider.getStorage(overflow.target, 0);
      let value = Number(storage);
      expect(value).to.be.equal(0);
      const max = 2**256 - 1;
      // make the sellerBalance to be the maximum value
      await attacker.addMax();
      storage = await ethers.provider.getStorage(overflow.target, 0);
      value = Number(storage);
      expect(value).to.be.equal(max);
      
      // cause the overflow
      await overflow.add(1);
      storage = await ethers.provider.getStorage(overflow.target, 0);
      value = Number(storage);
      expect(value).to.be.equal(0);
    });
  });