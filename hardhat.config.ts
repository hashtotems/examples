import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "./tasks/deploy";
import "./tasks/invoke";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    enabled: true,
    currency: 'USD',
    showTimeSpent: true
    // gasPrice: 150 // load at runtime
  },
  networks: {
    hardhat: {
      chainId: 1337,
      gasPrice: 160 * 10 ** 9,
      blockGasLimit: 12800000
    }
  },
  solidity: {
    compilers: [{
      version: "0.8.3", settings: {
        optimizer: {
          enabled: true,
          runs: 1000
        }
      }
    }]
  }
};

export default config;