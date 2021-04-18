import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "./tasks/deploy";
import "./tasks/invoke";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: 'USD',
    gasPrice: 200
  },
  networks: {
    hardhat: {
      chainId: 1337
    }
  },
  solidity: {
    compilers: [{
      version: "0.8.3", settings: {}
    }]
  }
};

export default config;