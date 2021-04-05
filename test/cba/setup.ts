import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { CryptoBubblesArtFactory } from "../../types/CryptoBubblesArtFactory";
import { ethers } from "hardhat";

chai.use(chaiAsPromised);
const should = chai.should();

describe("CryptoBubbles", function () {
  before(async function () {
    this.reset = async () => {
      const Factory = (await ethers.getContractFactory(
        "CryptoBubblesArt"
      )) as CryptoBubblesArtFactory;
      const contract = await Factory.deploy();
      await contract.deployed();
      this.contract = contract;

      const [owner, address1, address2] = await ethers.getSigners();
      this.owner = owner;
      this.address1 = address1;
      this.address2 = address2;
    };

    await this.reset();
  });

  require("./CryptoBubblesArt");
});
