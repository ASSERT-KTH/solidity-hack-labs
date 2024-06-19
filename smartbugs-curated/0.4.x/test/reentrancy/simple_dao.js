const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("Reentrancy Attack for simpleDAO.sol", function () {

    async function deployContracts() {
    // Deploy SimpleDAO contract
    console.log('start')
    const SimpleDAO = await ethers.getContractFactory('contracts/dataset/reentrancy/simple_dao.sol:SimpleDAO');
    console.log('getContractFactory')
    const simpleDAO = await SimpleDAO.deploy();
    console.log('deploy')
    await simpleDAO.waitForDeployment();
    let address;
    simpleDAO.getAddress().then(function(add) {
        console.log('inside address')
        console.log(add) // "Some User token"
        address=add
        return address
    });
    console.log('address'+simpleDAO.getAddress());
    console.log('start of malicious')
    console.log(address);

    // Deploy MaliciousContract with SimpleDAO address
    const MaliciousContract = await ethers.getContractFactory('contracts/reentrancy/simple_dao_attack.sol:MaliciousContract');
    const maliciousContract = await MaliciousContract.deploy(simpleDAO.getAddress().then(function(add) {
        return add }));
    await maliciousContract.waitForDeployment();
    console.log('after deploying malicious')

    maliciousContract.getAddress().then(function(add) {
        console.log('inside malicious address')
        console.log(add) // "Some User token"
        address=add
        return address
    });
    return {simpleDAO, maliciousContract}
    }


  it("should successfully drain funds through reentrancy attack", async function () {
    const {simpleDAO, maliciousContract} = await loadFixture(deployContracts);
    await simpleDAO.Deposit({ value: ethers.utils.parseEther("2") });
    // Initial donation to SimpleDAO contract by MaliciousContract
    await maliciousContract.attack({ value: ethers.utils.parseEther("1") });

    // Check balances after attack
    const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.address);
    const simpleDAOBalance = await ethers.provider.getBalance(simpleDAO.address);

    // Verify the attack was successful
    expect(maliciousContractBalance).to.equal(ethers.utils.parseEther("0"));
    expect(simpleDAOBalance).to.equal(ethers.utils.parseEther("1"));
  });
});
