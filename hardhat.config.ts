import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: 'USD',
    gasPrice: 200
  },
  networks: {
    ...process.env.RINKEBY_DEPLOYER_SECRET && {
      rinkeby: {
        url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
        accounts: [`0x${process.env.RINKEBY_DEPLOYER_SECRET}`]
      }
    },
    hardhat: {
      chainId: 1337
    },
  },
  ...process.env.ETHERSCAN_API_KEY && {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY
    }
  },
  solidity: {
    compilers: [{
      version: "0.8.3", settings: {}
    }]
  }
};

export default config;