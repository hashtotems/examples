import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { BubblesFactory } from "../../types";
import { ethers } from "hardhat";

chai.use(chaiAsPromised);
const should = chai.should();

describe("CryptoBubbles", function () {
  before(async function () {
    this.reset = async () => {
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
    };
  });

  beforeEach(async function () {
    await this.reset();
  });

  require("./Bubbles");
});
