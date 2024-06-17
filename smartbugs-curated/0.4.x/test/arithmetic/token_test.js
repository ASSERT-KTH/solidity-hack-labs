const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack arithmetic/token.sol', function () {
    let to_address;
    async function deployContracts() {
      const randomPrivateKey = ethers.Wallet.createRandom().privateKey;

      to_address = ethers.computeAddress(randomPrivateKey);
      const Token = await ethers.getContractFactory('contracts/dataset/arithmetic/token.sol:Token');
      const victim = await Token.deploy(1);  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const TokenAttacker = await ethers.getContractFactory('contracts/arithmetic/token_attack.sol:TokenAttacker');
      const attacker = await TokenAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

  
    it('exploit underflow vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      const attacker_addr = await attacker.getAddress();
      expect(await victim.balanceOf(attacker_addr)).to.equal(0);
      await attacker.attack(to_address);
      expect(await victim.balanceOf(attacker_addr)).to.greaterThan(0);
      expect(await victim.balanceOf(to_address)).to.equal(1);
    });
  });