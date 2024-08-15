require("@nomicfoundation/hardhat-toolbox");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.4.24",
      },
      {
        version: "0.4.25",
      },
      {
        version: "0.5.0",
      },
    ],
  },
  networks: {
    hardhat: {
      hardfork: "shanghai",
      gas: "auto",
      mining: {
        mempool: {
          order: "fifo"
        }
      }
    }
  }
};
