import { ethers } from "hardhat";
import { CryptoBubblesArtFactory } from "../types";

(async () => {
  const Factory = await ethers.getContractFactory('CryptoBubblesArt') as CryptoBubblesArtFactory;
  const contract = await Factory.deploy();
  await contract.deployed();
  console.log('Greeter deployed to:', contract.address);
})();

process.on('unhandledRejection', (reason, promise) => {
  console.error(reason);
  process.exit(1);
});