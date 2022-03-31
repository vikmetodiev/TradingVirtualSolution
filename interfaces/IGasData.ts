import { BigNumberish } from "ethers";

export interface IGasData {
  gasLimit: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
  maxFeePerGas: BigNumberish;
}
