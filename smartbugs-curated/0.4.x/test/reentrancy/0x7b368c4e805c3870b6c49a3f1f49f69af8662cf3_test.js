const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for 0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3.sol", function () {
  let W_WALLET;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    const logPath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3.sol/Log.json');
    const logJson = JSON.parse(fs.readFileSync(logPath));
    Log = await ethers.getContractFactory(logJson.abi, logJson.bytecode);
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy w_WALLET contract with Log address
    const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3.sol/W_WALLET.json');
    const json = JSON.parse(fs.readFileSync(codePath));
    W_WALLET = await ethers.getContractFactory(json.abi, json.bytecode);
    victim = await W_WALLET.deploy(log.target);
    await victim.waitForDeployment();
 
    // Deploy MaliciousContract with W_WALLET address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3_attack.sol:MaliciousContract");
    hacker = await MaliciousContract.deploy(victim.target);
    
  });

  it('sanity check: reentrancy/0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3.sol', async function () {
    await expect(victim.Put( 0, { value: 0 })).to.not.be.reverted;
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to victim contract
    await victim.Put( 1, {value: ethers.parseEther("5") });

    const victimInitialBalance = await ethers.provider.getBalance(victim.target);
    expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


    // Initial deposit from maliciousContract on victim contract
    await hacker.deposit({value:  ethers.parseEther("5")});

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("10")); 

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
    
    // victim has lost more than the 3 ethers from withdraw (10 -3 = 7)
    expect(victimBalance).to.be.below(ethers.parseEther("7")); 

    //hacker has more than the withdrawn amount
    expect(maliciousContractBalance).to.be.above(ethers.parseEther("3"));
    
  });
});
