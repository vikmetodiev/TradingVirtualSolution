import { Interface } from "@ethersproject/abi";
import { parseEther } from "@ethersproject/units";
import { ChainId } from "@usedapp/core";
import MultiSenderJSON from "../artifacts/contracts/MultiSender.sol/MultiSender.json";

export const ADDRESS_LIST_INPUT_FORMATS = ".txt,.csv" as const;

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

export const MULTISENDER_ADDRESS: { [key in ChainId]: string | undefined } = {
  [ChainId.Mainnet]: undefined,
  [ChainId.BSC]: undefined,
  [ChainId.Rinkeby]: "0x6f6DE4D2Fd041f1913D9d1aa7E8bc3AE12c8647F",
  [ChainId.BSCTestnet]: undefined,
  [ChainId.Ropsten]: undefined,
  [ChainId.Polygon]: undefined,
  [ChainId.xDai]: undefined,
  [ChainId.Kovan]: undefined,
  5: undefined,
  361: undefined,
  365: undefined,
  1285: undefined,
  80001: undefined,
  1666600000: undefined,
  11297108109: undefined,
  1337: undefined,
  31337: undefined,
  250: undefined,
};

export function getCost(count: number, chainId?: number | ChainId) {
  let cost = 0;
  if (count >= 0 && count < 100) {
    cost = 0.01;
  } else if (count < 500) {
    cost = 0.05;
  } else {
    cost = 0.1;
  }
  return parseEther(cost.toString());
}

export const MultiSenderInterface = new Interface(MultiSenderJSON.abi);
