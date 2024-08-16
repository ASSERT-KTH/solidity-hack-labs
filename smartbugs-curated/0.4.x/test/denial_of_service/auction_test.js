const { loadFixture, mine } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack denial_of_service/auction.sol', function () {
    async function deployContracts() {

        const DosAuction = await ethers.getContractFactory('contracts/dataset/denial_of_service/auction.sol:DosAuction');
        const victim = await DosAuction.deploy();
        await victim.waitForDeployment();


        const DosAuctionAttacker = await ethers.getContractFactory('contracts/denial_of_service/auction_attack.sol:DosAuctionAttacker');
        const attacker = await DosAuctionAttacker.deploy(victim.target);
        await attacker.waitForDeployment();

    return {victim, attacker};
    }

  
    it('exploit denial of service vulnerability', async function () {
        const {victim, attacker} = await loadFixture(deployContracts);

        const [v, a] = await ethers.getSigners();
        const amount = 1;
        await attacker.connect(a).attack({value: amount});
        
        const victimBalance = await ethers.provider.getBalance(victim.target);
        expect(victimBalance).to.equal(amount);

        // any other user bid will be reverted
        await expect(victim.connect(v).bid({value: 2})).to.be.reverted;
        
        const victimBalanceAfter = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceAfter).to.equal(amount);

    });
  });