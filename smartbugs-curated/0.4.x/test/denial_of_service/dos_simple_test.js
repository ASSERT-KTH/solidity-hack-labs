const { loadFixture, mine } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack denial_of_service/dos_simple.sol', function () {
    async function deployContracts() {

        const DosOneFunc = await ethers.getContractFactory('contracts/dataset/denial_of_service/dos_simple.sol:DosOneFunc');
        const victim = await DosOneFunc.deploy();
        await victim.waitForDeployment();


        const DosOneFuncAttacker = await ethers.getContractFactory('contracts/denial_of_service/dos_simple_attack.sol:DosOneFuncAttacker');
        const attacker = await DosOneFuncAttacker.deploy(victim.target);
        await attacker.waitForDeployment();

    return {victim, attacker};
    }

  
    it('exploit denial of service vulnerability', async function () {
        const {victim, attacker} = await loadFixture(deployContracts);

        await network.provider.send("evm_setAutomine", [false]);
        await network.provider.send("evm_setIntervalMining", [0]);
      
        const tx1 = await attacker.attack();
        const tx2 = await victim.ifillArray();

        await network.provider.send("evm_mine");


        const receipt1 = await (await tx1).wait();
        expect(receipt1.status).to.equal(1); // Ensure tx1 was successful

        const tx2Receipt = await ethers.provider.getTransactionReceipt(tx2.hash);
        expect(tx2Receipt).to.be.null; // Ensure tx2 was not included in the block due to out of gas error

    });

  });