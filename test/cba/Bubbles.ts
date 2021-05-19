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
          .togglePause()
          .should.be.rejectedWith("caller is not the owner");
      });

      it("should allow owner to unpause", async function () {
        await this.contract.paused().should.eventually.equal(true);
        await this.contract.connect(this.owner).togglePause();
        await this.contract.paused().should.eventually.equal(false);
      });

      it("should reject pause from unknown addresses", async function () {
        await this.contract.paused().should.eventually.equal(true);
        await this.contract.togglePause();
        await this.contract.paused().should.eventually.equal(false);
        await this.contract
          .connect(this.address1)
          .togglePause()
          .should.be.rejectedWith("caller is not the owner");
        await this.contract.paused().should.eventually.equal(false);
      });
    });

    describe("sale", () => {

      beforeEach(async function () {
        await this.contract.togglePause();
      });

      it("should be initially inactive", async function () {
        this.contract.selling().should.eventually.equal(false);
      });

      it("should not accept transactions", async function () {
        await this.contract
          .purchase("1", {
            value: ethers.utils.parseEther("0.1"),
          })
          .should.be.rejectedWith("sale is not active");
      });

      it("should reject toggle from unknown addresses", async function () {
        await this.contract
          .connect(this.address1)
          .toggleSale()
          .should.be.rejectedWith("caller is not the owner");
      });

      it("should allow owner to activate", async function () {
        await this.contract.selling().should.eventually.equal(false);
        await this.contract.connect(this.owner).toggleSale();
        await this.contract.selling().should.eventually.equal(true);
      });

      it("should reject toggle from unknown addresses", async function () {
        await this.contract.selling().should.eventually.equal(false);
        await this.contract.toggleSale();
        await this.contract.selling().should.eventually.equal(true);
        await this.contract
          .connect(this.address1)
          .toggleSale()
          .should.be.rejectedWith("caller is not the owner");
        await this.contract.selling().should.eventually.equal(true);
      });
    });
  });

  describe("Preconditions Satisfied", function () {
    beforeEach(async function () {
      await this.contract.togglePause();
      await this.contract.toggleSale();
    });

    it("should permit transactions", async function () {
      await this.contract.connect(this.address1).purchase("1", {
        value: ethers.utils.parseEther("0.1"),
      });
    });
  });

  describe("Transact", function () {
    beforeEach(async function () {
      await this.contract.togglePause();
      await this.contract.toggleSale();
    });

    it("should reject transactions with incorrect amount", async function () {
      const transact = (amount: string, price: string) =>
        this.contract
          .connect(this.address1)
          .purchase(amount, { value: ethers.utils.parseEther(price) });

      await transact("0", "0.05").should.be.rejectedWith("not enough");

      await transact("-1", "0.05").should.be.rejectedWith(
        "value out-of-bounds"
      );

      await transact("21", "0.05").should.be.rejectedWith("too much");

      await transact(
        "2100000000000000000000000000000000000000000000000",
        "0.05"
      ).should.be.rejectedWith("too much");
    });

    it.skip("should reject transactions when supply is depleted (slow)", async function () {
      this.timeout(300000);

      const transact = (amount: string, price: string) => {
        // console.log(`Executing transaction ${amount}:${price}`);
        process.stdout.write(".");

        return this.contract
          .connect(Math.random() > 0.5 ? this.address1 : this.address2)
          .purchase(amount, { value: ethers.utils.parseEther(price) });
      };

      await drain.bind(this)([
        { amount: 5553, price: "0.1" }
      ]);

      // one token left at this stage

      await transact("2", "0.2").should.be.rejectedWith("not enough supply");
      await transact("1", "0.1");
      await transact("1", "0.1").should.be.rejectedWith("not enough supply");
    });

    it("should verify ownership of bought tokens", async function () {
      await this.contract.connect(this.address1).purchase("1", {
        value: ethers.utils.parseEther("0.1"),
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
        value: ethers.utils.parseEther("0.1"),
      });

      const uri = await this.contract.tokenURI("0");

      uri.should.equal(
        "ipfs://QmbD3sWqKfBNYSCt8MLCkbWHuYgxobW75AnhM9Hyjv1D6a/0"
      );
    });

    it("should get tokens of owner", async function () {
      await this.contract.connect(this.address1).purchase("10", {
        value: ethers.utils.parseEther("1"),
      });

      const list = await this.contract.tokensOfOwner(this.address1.address);

      list
        .map((s) => s.toString())
        .should.deep.equal(new Array(10).fill(0).map((_, i) => i.toString())); // [55,56,57,58,59,60,61,62,63,64]

      const uri = await this.contract.tokenURI("0");

      uri.should.equal(
        "ipfs://QmbD3sWqKfBNYSCt8MLCkbWHuYgxobW75AnhM9Hyjv1D6a/0"
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

  describe("set final base token uri", function () {
    beforeEach(async function () {
      await this.contract.togglePause();
      await this.contract.toggleSale();
    });

    it("should successfully set the correct token", async function () {
      await this.contract.setBaseTokenURI("ipfs://QmbD3sWqKfBNYSCt8MLCkbWHuYgxobW75AnhM9Hyjv1D6a/");
    });

    it("should reject bogus uris", async function () {
      await this.contract.setBaseTokenURI("ipfs://fake/").should.eventually.be.rejectedWith('..');
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
