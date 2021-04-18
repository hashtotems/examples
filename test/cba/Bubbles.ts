import { ethers } from "ethers";

describe("Contract", function () {
  describe("Stats", function () {
    it("should be deployed with correct metadata", async function () {
      await this.contract.name().should.eventually.equal("CryptoBubblesArt");
      await this.contract.symbol().should.eventually.equal("BUBBLE");
    });
  });

  describe("Preconditions", function () {
    describe("Paused", () => {
      it("should be initially paused", async function () {
        this.contract.paused().should.eventually.equal(true);
      });

      it("should not accept transactions", async function () {
        await this.contract
          .purchase("1", {
            value: ethers.utils.parseEther("0.05"),
          })
          .should.be.rejectedWith("paused");
      });

      it("should reject unpause from unknown addresses", async function () {
        await this.contract
          .connect(this.address1)
          .unpause()
          .should.be.rejectedWith("caller is not the owner");
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
          .should.be.rejectedWith("caller is not the owner");
        await this.contract.paused().should.eventually.equal(false);
      });
    });

    describe.skip("Giveaway", function () {
      beforeEach(async function () {
        await this.contract.unpause();
      });

      it("should not allow purchases until giveaway is claimed", async function () {
        await this.contract
          .connect(this.address1)
          .purchase("1", {
            value: ethers.utils.parseEther("0"),
          })
          .should.be.rejectedWith("giveaway not claimed");
      });

      it("should claim 55 giveaway tokens in batches", async function () {
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("5");
      });

      it("should limit the number of giveaway tokens", async function () {
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("10");
        await this.contract.lockGiveaway("10");
        await this.contract
          .lockGiveaway("10")
          .should.be.rejectedWith("honour giveaway supply");
      });

      it("should reject claims from unknown addresses", async function () {
        await this.contract
          .connect(this.address1)
          .lockGiveaway("1")
          .should.be.rejectedWith("caller is not the owner");
      });

      it("should reflect giveaway tokens in owners balance", async function () {
        await this.lockGiveaway();

        const tokens = await this.contract.tokensOfOwner(this.owner.address);

        tokens
          .map((t) => t.toString())
          .should.deep.equal(new Array(55).fill(0).map((_, i) => i.toString()));
      });
    });
  });

  describe("Preconditions Satisfied", function () {
    beforeEach(async function () {
      await this.contract.unpause();
      // await this.lockGiveaway();
    });

    it("should permit transactions", async function () {
      await this.contract.connect(this.address1).purchase("1", {
        value: ethers.utils.parseEther("0.05"),
      });
    });
  });

  describe("Transact", function () {
    beforeEach(async function () {
      await this.contract.unpause();
      // await this.lockGiveaway();
    });

    it("should reject transactions with incorrect amount", async function () {
      const transact = (amount: string, price: string) =>
        this.contract
          .connect(this.address1)
          .purchase(amount, { value: ethers.utils.parseEther(price) });

      await transact("0", "0.05").should.be.rejectedWith("fixed amount");

      await transact("-1", "0.05").should.be.rejectedWith(
        "value out-of-bounds"
      );

      await transact("21", "0.05").should.be.rejectedWith("fixed amount");

      await transact(
        "2100000000000000000000000000000000000000000000000",
        "0.05"
      ).should.be.rejectedWith("not enough supply");
    });

    it("should reject transactions when supply is depleted (slow)", async function () {
      this.timeout(300000);

      const transact = (amount: string, price: string) => {
        // console.log(`Executing transaction ${amount}:${price}`);
        process.stdout.write(".");

        return this.contract
          .connect(Math.random() > 0.5 ? this.address1 : this.address2)
          .purchase(amount, { value: ethers.utils.parseEther(price) });
      };

      await drain.bind(this)([
        { amount: 2948, price: "0.05" },
        { amount: 2498, price: "0.07" },
        { amount: 1998, price: "0.2" },
        { amount: 1498, price: "0.5" },
        { amount: 998, price: "1.0" },
        { amount: 4, price: "5.0" },
      ]);

      // one token left at this stage

      await transact("2", "10").should.be.rejectedWith("not enough supply");
      await transact("1", "5");
      await transact("1", "5").should.be.rejectedWith("finished");
    });

    it("should adjust prices when crossing tiers", async function () {
      this.timeout(300000);

      const transact = (amount: string, price: string) =>
        this.contract
          .connect(Math.random() > 0.5 ? this.address1 : this.address2)
          .purchase(amount, { value: ethers.utils.parseEther(price) });

      const deplete = async () => {
        // TIER_1 (2948 tokens, 0.05 ether)
        // for (let i = 0; i < 267; i++) {
        //   await transact("11", "0.55"); // 11 * 0.05
        // }

        await drain.bind(this)([{ amount: 2937, price: "0.05" }]);
      };

      await deplete();

      await transact("20", "1.0").should.be.rejectedWith("not exact amount"); // 0.05 * 20, should throw
      await transact("20", "1.18"); // 0.05 * 11 + 0.07 * 9, should pass
    });

    it("should verify ownership of bought tokens", async function () {
      await this.contract.connect(this.address1).purchase("1", {
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
      await this.contract.connect(this.address1).purchase("1", {
        value: ethers.utils.parseEther("0.05"),
      });

      const uri = await this.contract.tokenURI("0");

      uri.should.equal(
        "ipfs://QmNviSTqyXu3H6ZucUiKnP94G3NAnqLREjJtn4Rv8gw1ms/0"
      );
    });

    it("should get tokens of owner", async function () {
      await this.contract.connect(this.address1).purchase("10", {
        value: ethers.utils.parseEther("0.50"),
      });

      const list = await this.contract.tokensOfOwner(this.address1.address);

      list
        .map((s) => s.toString())
        .should.deep.equal(
          new Array(10).fill(0).map((_, i) => (i).toString())
        ); // [55,56,57,58,59,60,61,62,63,64]

      const uri = await this.contract.tokenURI("0");

      uri.should.equal(
        "ipfs://QmNviSTqyXu3H6ZucUiKnP94G3NAnqLREjJtn4Rv8gw1ms/0"
      );

      const address = await this.contract.ownerOf("9");

      address.toString().should.equal(this.address1.address);
    });

    // it("should reflect transaction in contract balance", async function () {
    //   await this.contract.connect(this.address1).purchase("1", {
    //     value: ethers.utils.parseEther("0.05"),
    //   });

    //   await this.contract.connect(this.address1).purchase("2", {
    //     value: ethers.utils.parseEther("0.1"),
    //   });

    //   const bal = await ethers.provider.getBalance(await this.contract.address);
    //   ethers.utils.formatEther(bal.toString()).should.equal("0.15");
    // });
  });

  describe("Estimate", function () {
    beforeEach(async function () {
      await this.contract.unpause();
      // await this.lockGiveaway();
    });

    it("should estimate how much ether is required for purchasing", async function () {
      await this.contract
        .connect(this.address1)
        .estimatePrice("0")
        .should.be.rejectedWith("fixed amount");

      await this.contract
        .connect(this.address1)
        .estimatePrice("21")
        .should.be.rejectedWith("fixed amount");

      const price = await this.contract
        .connect(this.address1)
        .estimatePrice("20");

      ethers.utils.formatEther(price.toString()).should.equal("1.0"); // 20 * 0.05
    });
  });

  describe.skip("LuckyDraw", function () {
    beforeEach(async function () {
      await this.contract.unpause();
      await this.lockGiveaway();
    });

    it("should lock 1% of total funds for a giveaway", async function () {
      this.timeout(300000);

      const initialBalance = await this.owner.getBalance();

      await this.contract
        .withdraw()
        .should.be.rejectedWith("nothing to withdraw");

      const transact = (amount: string, price: string) =>
        this.contract
          .connect(this.address2)
          .purchase(amount, { value: ethers.utils.parseEther(price) });

      await transact("10", "0.5");

      await this.contract.withdraw();

      const finalBalance = await this.owner.getBalance();

      // 0.495 minus gas costs
      finalBalance
        .sub(initialBalance)
        .toString()
        .should.equal("494544088000000000");
    });

    it("should give a random token holder the funds", async function () {
      this.timeout(300000);

      await drain.bind(this)([
        { amount: 2948, price: "0.05" },
        { amount: 2498, price: "0.07" },
        { amount: 1998, price: "0.2" },
        { amount: 1498, price: "0.5" },
        { amount: 998, price: "1.0" },
        { amount: 5, price: "5.0" },
      ]);

      const initialBalance1 = await this.address1.getBalance();
      const initialBalance2 = await this.address2.getBalance();

      await this.contract.draw();

      const finalBalance1 = await this.address1.getBalance();
      const finalBalance2 = await this.address2.getBalance();

      const diff1 = Number(
        ethers.utils.formatEther(finalBalance1.sub(initialBalance1))
      );
      const diff2 = Number(
        ethers.utils.formatEther(finalBalance2.sub(initialBalance2))
      );

      // ~24 eth giveaway on soldout
      (diff1 + diff2).should.be.greaterThan(24);
      (diff1 + diff2).should.be.lessThan(25);
    });
  });
});

async function transact(
  this: Mocha.Context,
  amount: number,
  price: ethers.BigNumber
) {
  process.stdout.write(".");

  return this.contract
    .connect(Math.random() > 0.5 ? this.address1 : this.address2)
    .purchase(amount.toString(), { value: price });
}

async function drain(
  this: Mocha.Context,
  pairs: { amount: number; price: string }[]
) {
  for (const pair of pairs) {
    const _amount = Math.min(pair.amount, 20);
    let total = pair.amount;

    while (total > 0) {
      const toPurchase = Math.min(total, _amount);
      await transact.bind(this)(
        toPurchase,
        ethers.utils
          .parseEther(pair.price)
          .mul(ethers.BigNumber.from(toPurchase))
      );
      total -= _amount;
    }
    process.stdout.write("\n");
  }
}
