const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack access_control/simple_suicide.sol', function () {
  let owner;
    async function deployContracts() {
      [owner] = await ethers.getSigners();
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/access_control/simple_suicide.sol/SimpleSuicide.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      const SimpleSuicide = await ethers.getContractFactory(json.abi, json.bytecode);
      const victim = await SimpleSuicide.connect(owner).deploy();  
      await victim.waitForDeployment();
      const address = await victim.getAddress();

      const SimpleSuicideAttacker = await ethers.getContractFactory('contracts/access_control/simple_suicide_attack.sol:SimpleSuicideAttacker');
      const attacker = await SimpleSuicideAttacker.deploy(address);  
      await attacker.waitForDeployment();
      return {victim, attacker};
    }

    it('sanity check: access_control/unprotected0.sol', async function () {
      const {victim} = await loadFixture(deployContracts);
      await expect(victim.connect(owner).sudicideAnyone(owner)).to.not.be.reverted;
    });

    it('exploit access control vulnerability', async function () {
      const {victim, attacker} = await loadFixture(deployContracts);
      expect(await ethers.provider.getCode(await victim.getAddress())).not.to.equal("0x");
      await attacker.attack();
      expect(await ethers.provider.getCode(await victim.getAddress())).to.equal("0x");
    });
  });