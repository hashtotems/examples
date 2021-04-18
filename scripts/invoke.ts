import { ethers, tasks } from "hardhat";
import { BubblesFactory } from "../types";

(async () => {
  console.log(tasks.verify.action);

  // const Factory = (await ethers.getContractFactory(
  //   "Bubbles"
  // )) as BubblesFactory;

  // const contract = await Factory.deploy();
  // await contract.deployed();

  // if (await contract.paused()) {
  //   await contract.unpause();
  // }

  // const userAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  // const signer = ethers.provider.getSigner(userAddress);

  // const contractWithSigner = contract.connect(signer);

  // console.log(
  //   await contractWithSigner.getBubbles("20", {
  //     value: ethers.utils.parseEther("1.0"), // 20 * 0.05 ether
  //   })
  // );

  // console.log(await contract.ownerOf("0"));
  // console.log(await contract.tokenURI("0"));
  // console.log(await contract.tokensOfOwner(userAddress));
})();

process.on("unhandledRejection", (reason, promise) => {
  console.error(reason);
  process.exit(1);
});
