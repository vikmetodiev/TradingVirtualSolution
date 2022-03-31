import { ChainId } from "@usedapp/core";

export const SWAP_PROVIDERS: {
  [chainId: number]: {
    providerName: string;
    router: string;
  };
} = {
  [ChainId.Rinkeby]: {
    providerName: "Uniswap",
    router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  },
};
