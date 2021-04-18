import config from "./hardhat.config";
import "./tasks/etherscan";

import * as dotenv from "dotenv";
dotenv.config();

export default Object.assign(config, {
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.RINKEBY_DEPLOYER_SECRET}`]
    }
  },
  etherscan: {
    apiKey: process.env.RINKEBY_ETHERSCAN_API_KEY
  }
});