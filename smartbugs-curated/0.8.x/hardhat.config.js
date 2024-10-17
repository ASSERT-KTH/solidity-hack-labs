require("@nomicfoundation/hardhat-toolbox");
const fs = require('fs');

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
    ],
  },
  networks: {
    hardhat: {
      initialDate: "2018-12-31 11:59:00 PM",
      hardfork: "shanghai",
    }
  },
  mocha: {
    reporter: './scripts/CustomReporter.js',
    reporterOptions: {
      json: false, // Export test results to JSON
    }
  },
};
