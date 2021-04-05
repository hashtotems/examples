import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: 'USD',
    gasPrice: 90
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
  },
  solidity: {
    compilers: [{
      version: "0.8.3", settings: {}
    }]
  }
};

export default config;