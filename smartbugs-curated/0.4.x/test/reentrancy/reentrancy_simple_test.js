const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
describe("Reentrancy Attack for reentrancy_simple.sol", function () {  
    let Reentrance;
    let victim;
    let MaliciousContract;
    let hacker;

    beforeEach(async function () {
        // Deploy Log contract

        // Deploy EtherStore contract with Log address
        const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/reentrancy/reentrancy_simple.sol/Reentrance.json');
        const json = JSON.parse(fs.readFileSync(codePath));
        Reentrance = await ethers.getContractFactory(json.abi, json.bytecode);
        victim = await Reentrance.deploy();
        await victim.waitForDeployment();

        // Deploy MaliciousContract with Reentrance address
        MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/reentrancy_simple_attack.sol:MaliciousContract");
        hacker = await MaliciousContract.deploy(victim.target);
        
    });

    it('sanity check: reentrancy/reentrancy_simple.sol', async function () {
        await expect(victim.addToBalance({value:0})).to.not.be.reverted;
    });

    it("should successfully drain funds through reentrancy attack", async function () {
        // Initial deposit to victim contract
        await victim.addToBalance( {value: ethers.parseEther("5") });

        const victimInitialBalance = await ethers.provider.getBalance(victim.target);
        expect(victimInitialBalance).to.equal(ethers.parseEther("5")); 


        // Initial deposit from hacker on victim contract
        await hacker.deposit({value:  ethers.parseEther("1")});

        const victimBalanceAfterDeposit = await ethers.provider.getBalance(victim.target);
        expect(victimBalanceAfterDeposit).to.equal(ethers.parseEther("6")); 

        // Set hacker balance to 0
        await network.provider.send("hardhat_setBalance", [
            hacker.target,
            "0x0",
          ]);
        let hackerBalance = await ethers.provider.getBalance(hacker.target);
        expect(hackerBalance).to.equal(0);


        // Perform reentrancy attack through MaliciousContract
        await hacker.attack();
        
        // Check balances after attack
        const victimBalance = await ethers.provider.getBalance(victim.target);
        hackerBalance = await ethers.provider.getBalance(hacker.target);

        // Verify the attack was successful
        
        // victim has a drained account
        expect(victimBalance).to.be.below(ethers.parseEther("5"));

        // 5 original balance + 2 from  initial deposit 
        expect(hackerBalance).to.be.above(ethers.parseEther("1"));

        
    });
    });
  