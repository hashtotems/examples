import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { CryptoBubblesArt } from "./types/CryptoBubblesArt";

declare global {
  namespace Mocha {
    interface Context {
      contract:CryptoBubblesArt,
      owner:SignerWithAddress,
      address1:SignerWithAddress,
      address2:SignerWithAddress,
      reset: Function
    }
  }
}