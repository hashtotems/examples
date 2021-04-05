import { ethers } from "hardhat";

describe("Contract", function () {
  beforeEach(async function () {
    await this.reset();
  });

  describe("Paused", () => {
    it("should be initially paused", async function () {
      this.contract.paused().should.eventually.equal(true);
    });

    it("should not accept transactions", async function () {
      await this.contract
        .getBubbles("1", {
          value: ethers.utils.parseEther("0.05"),
        })
        .should.be.rejectedWith("paused");
    });

    it("should reject unpause from unknown addresses", async function () {
      await this.contract
        .connect(this.address1)
        .unpause()
        .should.be.rejectedWith("must have pauser role to unpause");
    });

    it("should allow owner to unpause", async function () {
      await this.contract.paused().should.eventually.equal(true);
      await this.contract.connect(this.owner).unpause();
      await this.contract.paused().should.eventually.equal(false);
    });

    it("should reject pause from unknown addresses", async function () {
      await this.contract.paused().should.eventually.equal(true);
      await this.contract.unpause();
      await this.contract.paused().should.eventually.equal(false);
      await this.contract
        .connect(this.address1)
        .pause()
        .should.be.rejectedWith("must have pauser role to pause");
      await this.contract.paused().should.eventually.equal(false);
    });

    it("should permit transactions in unpaused state", async function () {
      await this.contract.unpause();
      await this.contract.paused().should.eventually.equal(false);
      await this.contract.connect(this.address1).getBubbles("1", {
        value: ethers.utils.parseEther("0.05"),
      });
    });
  });

  describe("Transact", function () {
    beforeEach(async function () {
      await this.contract.unpause();
    });

    it("should reject transactions with incorrect amount", async function () {
      const transact = (amount: string, price: string) =>
        this.contract
          .connect(this.address1)
          .getBubbles(amount, { value: ethers.utils.parseEther(price) });

      await transact("0", "0.05").should.be.rejectedWith("fixed amount");
      await transact("-1", "0.05").should.be.rejectedWith(
        "value out-of-bounds"
      );
      await transact("21", "0.05").should.be.rejectedWith("fixed amount");
      await transact(
        "2100000000000000000000000000000000000000000000000",
        "0.05"
      ).should.be.rejectedWith("fixed amount");
    });

    it("should reject transactions when supply is depleted (slow)", async function () {
      this.timeout(300000);

      const transact = (amount: string, price: string) => {
        // console.log(`Executing transaction ${amount}:${price}`);

        return this.contract
          .connect(Math.random() > 0.5 ? this.address1 : this.address2)
          .getBubbles(amount, { value: ethers.utils.parseEther(price) });
      };

      const deplete = async () => {
        // TIER_1 (2948 tokens, 0.05 ether)
        for (let i = 0; i < 268; i++) {
          await transact("11", "0.55"); // 11 * 0.05
        }
        // TIER_2 (2498 tokens, 0.07 ether)
        for (let i = 0; i < 1249; i++) {
          await transact("2", "0.14"); // 2 * 0.07
        }
        // TIER_3 (1998 tokens, 0.2 ether)
        for (let i = 0; i < 111; i++) {
          await transact("18", "3.6"); // 18 * 0.2
        }
        // TIER_4  (1498 tokens, 0.5 ether)
        for (let i = 0; i < 107; i++) {
          await transact("14", "7"); // 14 * 0.5
        }
        // TIER_5  (998 tokens, 1 ether)
        for (let i = 0; i < 499; i++) {
          await transact("2", "2"); // 2 * 1.0
        }
        // TIER_6  (5 tokens, 5 ether)
        await transact("4", "20"); // 4 * 1.0
      };

      await deplete();

      // one token left at this stage

      await transact("2", "10").should.be.rejectedWith("not enought bubbles");
      await transact("1", "5");
      await transact("1", "5").should.be.rejectedWith("finished");
    });

    it("should adjust prices when crossing tiers", async function () {
      this.timeout(300000);

      const transact = (amount: string, price: string) =>
        this.contract
          .connect(Math.random() > 0.5 ? this.address1 : this.address2)
          .getBubbles(amount, { value: ethers.utils.parseEther(price) });

      const deplete = async () => {
        // TIER_1 (2948 tokens, 0.05 ether)
        for (let i = 0; i < 267; i++) {
          await transact("11", "0.55"); // 11 * 0.05
        }
      };

      await deplete();

      await transact("20", "1.0").should.be.rejectedWith("not exact amount"); // 0.05 * 20, should throw
      await transact("20", "1.18"); // 0.05 * 11 + 0.07 * 9, should pass
    });

    it("should verify ownership of bought tokens", async function () {
      await this.contract.connect(this.address1).getBubbles("1", {
        value: ethers.utils.parseEther("0.05"),
      });

      const address = await this.address1.getAddress();
      const balance = await this.contract.balanceOf(address);
      balance.toString().should.equal("1");

      const index = await this.contract.tokenByIndex("0");
      index.toString().should.equal("0");

      const owner = await this.contract.tokenOfOwnerByIndex(address, index);
      owner.toString().should.equal("0");
    });

    it("should set a placeholder token uri", async function () {
      await this.contract.connect(this.address1).getBubbles("1", {
        value: ethers.utils.parseEther("0.05"),
      });

      const uri = await this.contract.tokenURI("0");
      uri.should.equal(
        "ipfs://QmNviSTqyXu3H6ZucUiKnP94G3NAnqLREjJtn4Rv8gw1ms/0.gif"
      );
    });

    it("should reflect transaction in contract balance", async function () {
      await this.contract.connect(this.address1).getBubbles("1", {
        value: ethers.utils.parseEther("0.05"),
      });

      await this.contract.connect(this.address1).getBubbles("2", {
        value: ethers.utils.parseEther("0.1"),
      });

      const bal = await ethers.provider.getBalance(await this.contract.address);
      ethers.utils.formatEther(bal.toString()).should.equal("0.15");
    });
  });

  describe("Estimate", function () {
    beforeEach(async function () {
      await this.contract.unpause();
    });

    it("should estimate how much wei is required for purchasing", async function () {
      await this.contract.connect(this.address1).estimatePrice("0")
        .should.be.rejectedWith("fixed amount");
      
      await this.contract.connect(this.address1).estimatePrice("21")
        .should.be.rejectedWith("fixed amount");

      const price = await this.contract.connect(this.address1).estimatePrice("20");
      ethers.utils.formatEther(price.toString()).should.equal("1.0"); // 20 * 0.05
    });
  });
});
