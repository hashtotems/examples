import { ethers } from "hardhat";
import { CryptoBubblesArtFactory } from "../types";

(async () => {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Factory = (await ethers.getContractFactory(
    "CryptoBubblesArt"
  )) as CryptoBubblesArtFactory;

  const contract = await Factory.deploy();
  await contract.deployed();

  console.log("Greeter deployed to:", contract.address);
})();

process.on("unhandledRejection", (reason, promise) => {
  console.error(reason);
  process.exit(1);
});