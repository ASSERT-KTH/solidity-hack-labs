const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("Reentrancy Attack for simpleDAO.sol", function () {

    async function deployContracts() {
    // Deploy SimpleDAO contract
    const SimpleDAOFactory = await ethers.getContractFactory('contracts/dataset/reentrancy/simple_dao.sol:SimpleDAO');
    const simpleDAO = await SimpleDAOFactory.deploy();
    await simpleDAO.waitForDeployment();

    // Deploy MaliciousContract with SimpleDAO address
    const MaliciousContractFactory = await ethers.getContractFactory('contracts/reentrancy/simple_dao_attack.sol:MaliciousContract');
    const maliciousContract = await MaliciousContractFactory.deploy(simpleDAO.target);
    await maliciousContract.waitForDeployment();
    
    //const [_, innocentAddress, attackerAddress] = [simpleDAO.target, maliciousContract.target];
    return {simpleDAO, maliciousContract}
    }


  it("should successfully drain funds through reentrancy attack", async function () {
    const {simpleDAO, maliciousContract} = await loadFixture(deployContracts);
    const [_, innocentAddress, attackerAddress] = [,simpleDAO.target, maliciousContract.target];

    console.log(innocentAddress);
    console.log(attackerAddress);

    // We add 10 ether into victim contract
    await simpleDAO.donate( innocentAddress, {
        value: ethers.parseEther("10"),
      });
 
    // Check that at this point the Victimontract's balance is 10 ETH
    let balanceETH = await ethers.provider.getBalance(simpleDAO.target);
    expect(balanceETH).to.equal(ethers.parseEther("10"));


    // Attacker calls the `attack` function on MaliciousContract
    // and sends 1 ETH
    await maliciousContract.attack({
        value: ethers.parseEther("1"),
      });

    // Check balances after attack
    const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.target);
    const simpleDAOBalance = await ethers.provider.getBalance(simpleDAO.target);

    // Verify the attack was successful
    expect(maliciousContractBalance).to.equal(ethers.parseEther("11")); //11= 1 from the donation, 10 from the attack
    expect(simpleDAOBalance).to.equal(ethers.parseEther("0"));
    
  });
});
