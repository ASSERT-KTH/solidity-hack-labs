const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack arithmetic/token.sol', function () {
    let to_address;
    let owner;
    async function deployContracts() {
      const randomPrivateKey = ethers.Wallet.createRandom().privateKey;
      [owner] = await ethers.getSigners();
      to_address = ethers.computeAddress(randomPrivateKey);
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/arithmetic/token.sol/Token.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      const Token = await ethers.getContractFactory(json.abi, json.bytecode);
      const victim = await Token.connect(owner).deploy(1);  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const TokenAttacker = await ethers.getContractFactory('contracts/arithmetic/token_attack.sol:TokenAttacker');
      const attacker = await TokenAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

    it('sanity check: arithmetic/token.sol', async function () {
      const {victim} = await loadFixture(deployContracts);
      expect(await victim.balanceOf(owner.address)).to.equal(1);
      expect(await victim.balanceOf(victim.target)).to.equal(0);
      await victim.transfer(victim.target, 1);
      expect(await victim.balanceOf(owner.address)).to.equal(0);
      expect(await victim.balanceOf(victim.target)).to.equal(1);
    });
  
    it('exploit underflow vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const attacker_addr = await attacker.getAddress();
      expect(await victim.balanceOf(attacker_addr)).to.equal(0);
      await attacker.attack(to_address);
      expect(await victim.balanceOf(attacker_addr)).to.greaterThan(0);
      expect(await victim.balanceOf(to_address)).to.equal(1);
    });
  });