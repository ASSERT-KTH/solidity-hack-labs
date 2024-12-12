require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.4.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.4.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.0",
      },
    ],
  },
  networks: {
    hardhat: {
      initialDate: "2018-12-31 11:59:00 PM",
      hardfork: "shanghai",
    },
  },
  mocha: {
    reporter: "./scripts/CustomReporter.js",
    reporterOptions: {
      json: true, // Export test results to JSON
    },
  },
};
