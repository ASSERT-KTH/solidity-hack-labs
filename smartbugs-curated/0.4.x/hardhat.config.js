require("@nomicfoundation/hardhat-toolbox");
const fs = require('fs');

// const { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS, TASK_TEST_GET_TEST_FILES } = require("hardhat/builtin-tasks/task-names");
// const path = require("path");

// const validPatchesPath = "/home/mokita/sc_study/solidity-hack-labs/smartbugs-curated/0.4.x/contracts/dataset/valid_patches.csv"; //provide a path to the file containing the list of patches

// function getPatches(filename) {
//   if (validPatchesPath === "") {
//     return [];
//   }
//   const lines = fs.readFileSync(filename, "utf-8").split("\r\n");
//   return lines;
// }

// const patches = getPatches(validPatchesPath);
// // remove empyt string from the list
// const index = patches.indexOf("");
// if (index > -1) {
//   patches.splice(index, 1);
// }

// subtask(
//   TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS,
//   async (_, { config }, runSuper) => {
//     const paths = await runSuper();
//     if (patches.length === 0) {
//       return paths;
//     }

//     let filtered = [];
//     filtered.push(path.join(config.paths.sources, "unchecked_low_level_calls/revert_contract.sol"));
//     filtered.push(path.join(config.paths.sources, "unchecked_low_level_calls/TokenEBU.sol"));
//     for (let i = 0; i < patches.length; i++) {
//       filename = path.join(patches[i].split("/")[1], patches[i].split("/")[2]);
//       filename = filename.replace(".sol", "_attack.sol");
//       filePath = path.join(config.paths.sources, filename);
//       if (fs.existsSync(filePath)) {
//         filtered.push(filePath);
//       }
//       filtered.push(path.join(config.paths.sources, patches[i]));
//     }
//     return filtered;
//   }
// );

// subtask(TASK_TEST_GET_TEST_FILES, async (_, { config }, runSuper) => {
//   const testFiles = await runSuper();

//   if (patches.length === 0) {
//     return testFiles;
//   }

//   potential_test_files = [];
//   for (let i = 0; i < patches.length; i++) {
//     filename = path.join(patches[i].split("/")[1], patches[i].split("/")[2]);
//     filename = filename.replace(".sol", "_test.js");
//     filename = path.join(config.paths.tests, filename);
//     potential_test_files.push(filename);
//   }

//   const filtered_test = testFiles.filter(item => potential_test_files.includes(item));

//   return filtered_test;
// });

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.4.24",
      },
      {
        version: "0.4.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
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
    }
  },
  mocha: {
    reporter: './scripts/CustomReporter.js',
    reporterOptions: {
      json: true, // Export test results to JSON
    }
  },
};
