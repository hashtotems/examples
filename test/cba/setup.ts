import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { BubblesFactory } from "../../types";
import { ethers } from "hardhat";

chai.use(chaiAsPromised);
const should = chai.should();

describe("CryptoBubbles", function () {
  before(async function () {
    this.reset = async () => {
      const Factory = (await ethers.getContractFactory(
        "Bubbles"
      )) as BubblesFactory;

      const contract = await Factory.deploy();
      await contract.deployed();

      this.contract = contract;

      const [owner, address1, address2] = await ethers.getSigners();

      this.owner = owner;
      this.address1 = address1;
      this.address2 = address2;
    };

    this.lockGiveaway = async () => {
      await this.contract.lockGiveaway("20");
      await this.contract.lockGiveaway("20");
      await this.contract.lockGiveaway("15");
    };
  });

  beforeEach(async function () {
    await this.reset();
  });

  require("./Bubbles");
});
