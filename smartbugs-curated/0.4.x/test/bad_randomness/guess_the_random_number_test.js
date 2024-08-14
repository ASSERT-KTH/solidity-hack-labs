const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
let amount;

describe('attack bad_randomness/guess_the_random_number.sol', function () {
    async function deployContracts() {
        const [v, a] = await ethers.getSigners();
        amount = ethers.parseEther('1');

        const options = {
            from: v,
            value: amount};
        const GuessTheRandomNumberChallenge = await ethers.getContractFactory('contracts/dataset/bad_randomness/guess_the_random_number.sol:GuessTheRandomNumberChallenge');
        const victim = await GuessTheRandomNumberChallenge.deploy(options);  

        const tx = await victim.deploymentTransaction().wait();
        const block = await ethers.provider.getBlock(tx.blockNumber);


        const GuessTheRandomNumberChallengeAttacker = await ethers.getContractFactory('contracts/bad_randomness/guess_the_random_number_attack.sol:GuessTheRandomNumberChallengeAttacker');
        const attacker = await GuessTheRandomNumberChallengeAttacker.deploy(victim.target);
        await attacker.waitForDeployment();

        await a.sendTransaction({
            to: attacker.target,
            value: amount
        });

    return {block, victim, attacker};
    }

  
    it('exploit bad randomness vulnerability', async function () {
        const {block, victim, attacker} = await loadFixture(deployContracts);

        const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceBefore).to.equal(amount);

        const attackerBalanceBefore = await ethers.provider.getBalance(attacker.target);
        expect(attackerBalanceBefore).to.equal(amount);

        await attacker.attack(block.number, block.timestamp);

        const victimBalanceAfter = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceAfter).to.equal(0);
        
        const attackerBalanceAfter = await ethers.provider.getBalance(attacker.target);
        expect(attackerBalanceAfter).to.equal(amount + amount);

    });
  });