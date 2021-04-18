import { task } from "hardhat/config";

task("etherscan", "Verifies contracts bytecode on etherscan")
  .addPositionalParam("contract", "Name of the contract to deploy")
  .setAction(async ({ contract }, { config, network, run }) => {
    console.log(`Verifying ${contract} bytecode on Etherscan ${network.name} network...`);

    const deploymentConfigDir = `${config.paths.root}/deployments/${contract}`;
    const deploymentConfigPath = `${deploymentConfigDir}/${network.name}.json`;
    const { address } = require(deploymentConfigPath);

    await run("verify:verify", { address });
  });
