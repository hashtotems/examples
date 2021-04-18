import { task } from "hardhat/config";
import { writeFileSync } from "fs";
import { sync as mkdirp } from "mkdirp";
import axios from "axios";

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

task("deploy", "Deploys a given contract")
  .addPositionalParam("contract", "Name of the contract to deploy")
  .addOptionalParam("gasprice", "Amount of gwei to pay for gas")
  .setAction(async ({ contract, gasprice }, { config, ethers, network }) => {
    const [deployer] = await ethers.getSigners();

    console.log(`Deploying to ${contract} contract to ${network.name} network...`);
    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    const factory = await ethers.getContractFactory(contract);
    
    const estimatedGas = await ethers.provider.estimateGas(factory.getDeployTransaction());
    console.log(`Gas estimate required for deployment: ${estimatedGas}`);

    const instance = await factory.deploy().then((c) => c.deployed());
    console.log(`Deployed ${contract} Address: ${instance.address}`);

    const gasPrice = gasprice ? Number(gasprice) * 10**9 : await getGasPrice("standard");
    const ethPrice = await getEthPrice();

    const deploymentCost = Number(ethers.utils.formatEther(estimatedGas.mul(gasPrice).mul(ethPrice))).toFixed(2);
    console.log(`Cost estimate: $${deploymentCost} (${estimatedGas} gas * ${gasPrice} wei * ${ethPrice} usd/eth)`);

    console.log(`Remaining Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    const deploymentConfigDir = `${config.paths.root}/deployments/${contract}`;
    const deploymentConfigPath = `${deploymentConfigDir}/${network.name}.json`;
    const relativePath = deploymentConfigPath.split(`${process.cwd()}/`).pop();

    mkdirp(deploymentConfigDir);

    writeFileSync(deploymentConfigPath, JSON.stringify({
      network: network.name,
      contract,
      address: instance.address,
      deployer: deployer.address,
      estimatedGas: estimatedGas.toNumber(),
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`Written deployment metadata to ${relativePath}`);
  });
