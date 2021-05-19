// import { ethers, run } from "hardhat";
// import { BubblesFactory } from "../types";

// (async () => {
//   const Factory = (await ethers.getContractFactory("Bubbles")) as BubblesFactory;

//   Factory.attach();

//   // const contract = await Factory
//   //   .deploy().then((c) =>
//   //     c.deployed());

//   const owner = await ethers.provider.getSigner(0);

//   const contractWithOwner = contract.connect(owner);
//   // const contractWithAddress1 = contract.connect(address1);
//   // const contractWithAddress2 = contract.connect(address2);

//   if (await contract.paused()) {
//     await contractWithOwner.unpause();
//     await contractWithOwner.lockGiveaway(10);
//     await contractWithOwner.lockGiveaway(10);
//     await contractWithOwner.lockGiveaway(10);
//     await contractWithOwner.lockGiveaway(10);
//     await contractWithOwner.lockGiveaway(10);
//     await contractWithOwner.lockGiveaway(5);
//   }

//   console.log(
//     await contractWithOwner.getBubbles("20", {
//       value: ethers.utils.parseEther("1.0"), // 20 * 0.05 ether
//     })
//   );

//   // console.log(await contract.ownerOf("0"));
//   // console.log(await contract.tokenURI("0"));
//   // console.log(await contract.tokensOfOwner(userAddress));
// })();

// process.on("unhandledRejection", (reason, promise) => {
//   console.error(reason);
//   process.exit(1);
// });
