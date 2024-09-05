const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe("attack unchecked_low_level_calls/unchecked_return_value.sol", function () {

  async function deployContracts() {
    const ReturnValue = await ethers.getContractFactory("contracts/dataset/unchecked_low_level_calls/unchecked_return_value.sol:ReturnValue");
    const contract = await ReturnValue.deploy();

    const ReturnValueAttacker = await ethers.getContractFactory("contracts/unchecked_low_level_calls/unchecked_return_value_attack.sol:ReturnValueAttacker");
    const attacker = await ReturnValueAttacker.deploy();

    return {contract, attacker}
  };

  it("should revert in callchecked when MaliciousContract is called", async function () {
    const {contract, attacker} = await loadFixture(deployContracts);
    // Ensure callchecked reverts on failure
    await expect(contract.callchecked(attacker.target)).to.be.reverted;
    // This call does not revert, even though the malicious contract fails
    await expect(contract.callnotchecked(attacker.target)).to.not.be.reverted;

  });
});
