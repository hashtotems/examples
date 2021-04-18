import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { BubblesFactory } from "../../types";
import { ethers } from "hardhat";

chai.use(chaiAsPromised);
const should = chai.should();

describe("CryptoBubbles", function () {
  before(async function () {
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
  });

  it('should unpause a fresh contract', async function () {
    const contractWithOwner = this.contract.attach(this.owner.address);
    await contractWithOwner.unpause();
  });

  for (let i = 0; i < 50; i++) {
    it('should purchase some tokens', async function () {
      const contractWithBuyer = this.contract.attach(this.address1.address);
  
      await contractWithBuyer.purchase("20", {
        value: ethers.utils.parseEther("1.00")
      });
    });
  }
});
