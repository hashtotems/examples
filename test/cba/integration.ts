import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { BubblesFactory } from "../../types";
import { ethers } from "hardhat";
import { SSL_OP_EPHEMERAL_RSA } from "node:constants";

chai.use(chaiAsPromised);
const should = chai.should();

describe("CryptoBubbles", function () {
  before(async function () {
    const [owner, address1, address2] = await ethers.getSigners();

    this.owner = owner;
    this.address1 = address1;
    this.address2 = address2;

    const Factory = (await ethers.getContractFactory(
      "Bubbles"
    )) as BubblesFactory;

    const contract = await Factory.deploy(
      "CryptoBubblesArt", 
        "BUBBLE", 
        "ipfs://QmbD3sWqKfBNYSCt8MLCkbWHuYgxobW75AnhM9Hyjv1D6a/", 
        owner.address, 
        // keccac256(ipfs://QmbD3sWqKfBNYSCt8MLCkbWHuYgxobW75AnhM9Hyjv1D6a/)
        "0xb0aa1fe3909a47fbe3557bce46c965c474336f3b52c2e53d149a18bafedc3f4f"
    );
    await contract.deployed();

    this.contract = contract;
  });

  it("should unpause a fresh contract", async function () {
    const contractWithOwner = this.contract.attach(this.owner.address);
    await contractWithOwner.togglePause();
    await contractWithOwner.toggleSale();
  });

  for (let i = 0; i < 50; i++) {
    it("should purchase some tokens", async function () {
      const contractWithBuyer = this.contract.attach(this.address1.address);

      await contractWithBuyer.purchase("1", {
        value: ethers.utils.parseEther("0.10"),
      });
    });
  }

  after(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  });
});
