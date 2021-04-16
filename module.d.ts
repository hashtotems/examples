import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Bubbles } from "./types";

declare global {
  namespace Mocha {
    interface Context {
      contract: Bubbles;
      owner: SignerWithAddress;
      address1: SignerWithAddress;
      address2: SignerWithAddress;
      reset: Function;
      lockGiveaway: Function;
    }
  }
}
