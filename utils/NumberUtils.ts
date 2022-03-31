import { ChainId } from "@usedapp/core";
import { SUPPORTED_CHAIN_IDS } from "../constants/networks";

export function getCharge(count: number) {
  let charge = 0;
  if (count < 100) {
    charge = 0.01;
  }
  return charge;
}

export function getSupportedChainId(chainId?: ChainId) {
  if (!chainId || !SUPPORTED_CHAIN_IDS.includes(chainId))
    return ChainId.Rinkeby;
  return chainId;
}

export function isSupportedChainId(chainId?: ChainId) {
  if (!chainId || !SUPPORTED_CHAIN_IDS.includes(chainId)) return false;
  return true;
}

export function getUnixTime(time: number) {
  return Math.floor(time / 1000);
}

export function getSignificant(input: string | number, units: number = 4) {
  let value = typeof input === "string" ? input : input.toString();
  if (value.lastIndexOf(".") === -1) return value;
  return value.substring(0, value.lastIndexOf(".") + units + 1);
}
