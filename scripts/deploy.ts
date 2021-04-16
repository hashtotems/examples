import { ethers } from "hardhat";
import { BubblesFactory } from "../types";

(async () => {
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
