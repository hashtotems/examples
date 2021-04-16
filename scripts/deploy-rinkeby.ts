import { ethers } from "hardhat";
import { BubblesFactory } from "../types";

(async () => {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Factory = (await ethers.getContractFactory(
    "Bubbles"
  )) as BubblesFactory;

  const contract = await Factory.deploy();
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
})();

process.on("unhandledRejection", (reason, promise) => {
  console.error(reason);
  process.exit(1);
});
