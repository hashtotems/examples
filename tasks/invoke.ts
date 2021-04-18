import { task } from "hardhat/config";
import { BubblesFactory } from "../types";
import axios from "axios";

const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

const chunksOf = (num:number, size:number, wait:boolean) => ({
  async forEach(fn: (n:number) => void) {
    let current = num;
    while (current > 0) {
      const nextChunk = Math.min(size, current);
      current -= nextChunk;
      await fn(nextChunk);
      // wait for the next block
      wait && await sleep(15000); 
    }
  }
});

const GAS_PRICE_URL = "https://www.etherchain.org/api/gasPriceOracle";
const ETH_PRICE_URL = "https://www.etherchain.org/index/data";

// safeLow, standard, fast, fastest
const getGasPrice = (variant = "standard") => axios
  .get(GAS_PRICE_URL)
  // price in wei
  .then(({ data }) => Math.round(data[variant]) * (10 ** 9));

const getEthPrice = () => axios
  .get(ETH_PRICE_URL)
  .then(({ data }) => Math.round(data.currentStats.price_usd));


task("invoke", "Invokes contract mechanics (Bubbles)")
  .setAction(async ({}, { config, network, ethers }) => {
    const contract = "Bubbles";

    console.log(`Triggering a mechanic on ${contract} in ${network.name} network...`);
    
    const deploymentConfigDir = `${config.paths.root}/deployments/Bubbles`;
    const deploymentConfigPath = `${deploymentConfigDir}/${network.name}.json`;
    const contractConfig = require(deploymentConfigPath);

    const owner = ethers.provider.getSigner(contractConfig.deployer);
    const Factory = await ethers.getContractFactory(contract) as BubblesFactory;
    const instance = Factory.attach(contractConfig.address);

    console.log(`Initial balance of owner: ${ethers.utils.formatEther(await owner.getBalance())} ETH`);

    if (await instance.paused()) {
      console.log(`Contract is paused... unpausing`);
      await instance.unpause({
        gasPrice: 150000000000
      });
      console.log(`Balance of owner after pausing: ${ethers.utils.formatEther(await owner.getBalance())} ETH`);
    } else {
      console.log(`Contract is already unpaused.`);
    }

    // const remainingGiveaway = (await instance.remainingGiveaway()).toNumber();

    // if (remainingGiveaway > 0) {
    //   console.log(`Pending claim of ${remainingGiveaway} giveaway tokens. Claiming...`);

    //   await sleep(15000); 

    //   await chunksOf(remainingGiveaway, 10, network.name !== 'localhost').forEach(async (amount) => 
    //     instance.lockGiveaway(amount, {
    //       gasPrice: 150000000000
    //     }));

    //   console.log(`Remaining balance after claim of giveaway: ${ethers.utils.formatEther(await owner.getBalance())} ETH`);
    // } else {
    //   console.log('Giveaway is already claimed');
    // }

    console.log('Purchasing a token');

    await sleep(15000); 

    await instance.purchase("1", {
      value: ethers.utils.parseEther("0.05"),
      gasPrice: 150000000000,
      gasLimit: 2000000
    });

    console.log(`Final balance: ${ethers.utils.formatEther(await owner.getBalance())} ETH`);

    // const remaining = Number(ethers.utils.formatEther(await owner.getBalance()));
    // const cost = (10000 - remaining) * await getEthPrice();
    // console.log(`Total cost of deploying, unpausing contract, claiming the giveaway a purchasing a single NFT token: ${cost}`);
  });