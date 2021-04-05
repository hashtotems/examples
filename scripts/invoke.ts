import { ethers } from "hardhat";
import { CryptoBubblesArtFactory } from "../types";

(async () => {
  const Factory = (await ethers.getContractFactory(
    "CryptoBubblesArt"
  )) as CryptoBubblesArtFactory;

  const contract = await Factory.deploy();
  await contract.deployed();

  if (await contract.paused()) {
    await contract.unpause();
  }

  const signer = ethers.provider.getSigner(
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  );
  const contractWithSigner = contract.connect(signer);

  console.log(
    await contractWithSigner.getBubbles("20", {
      value: ethers.utils.parseEther("1.0"), // 20 * 0.05 ether
    })
  );

  console.log(await contract.ownerOf("0"));
  console.log(await contract.tokenURI("0"));
})();

process.on("unhandledRejection", (reason, promise) => {
  console.error(reason);
  process.exit(1);
});
