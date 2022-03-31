import { ChainId } from "@usedapp/core";
import { BigNumber } from "ethers";
import { IDeflationProps } from "./IDeflationProps";

export interface IERC20TokenProps {
  chainId: ChainId;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  owner: string;
  canMint: boolean;
  canBurn: boolean;
  canPause: boolean;
  blacklist: boolean;
  deflation?: IDeflationProps;
}
