import {
  BNB,
  ChainId,
  Config,
  Ether,
  getChainName,
  NativeCurrency,
  NATIVE_CURRENCY as NC,
  NodeUrls,
} from "@usedapp/core";
import { MULTISENDER_ADDRESS } from "./multisender";

export const DAPP_CONFIG: Config = {
  localStorage: {
    transactionPath: "vt_solutions_transactions",
  },
  readOnlyUrls: {
    [ChainId.Mainnet]:
      "https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934",
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(MULTISENDER_ADDRESS)
  .filter((k) => !!MULTISENDER_ADDRESS[k])
  .map((x) => +x);

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;

export const NODE_URLS: NodeUrls = {
  [ChainId.Mainnet]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [ChainId.Rinkeby]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [ChainId.Ropsten]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [ChainId.Goerli]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [ChainId.Kovan]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
  [ChainId.BSC]: `https://bsc-dataseed.binance.org/`,
  [ChainId.BSCTestnet]: ``,
};

interface INetworkInfo {
  id: ChainId | number;
  chainId: string;
  chainName: string;
  rpcUrls: [NodeUrls];
  blockExplorerUrls: string[];
}

const NETWORKS: INetworkInfo[] = SUPPORTED_CHAIN_IDS.map((c) => ({
  id: c,
  chainId: "0x" + c.toString(16),
  chainName: getChainName(c),
  rpcUrls: [NODE_URLS[c]],
  blockExplorerUrls: [],
}));

export const NETWORK_ITEMS: {
  [chainId: number]: INetworkInfo;
} = NETWORKS.reduce(
  (prev, curr) => ({
    ...prev,
    [curr.id]: {
      ...curr,
    },
  }),
  {}
);

export const NATIVE_CURRENCY: {
  [chainId: number]: NativeCurrency;
} = {
  ...NC,
  [ChainId.Rinkeby]: { ...Ether, ticker: "rETH", format: Ether.format },
  [ChainId.BSCTestnet]: BNB,
};

interface NetworkSpeed {
  slow: number;
  fast: number;
  instant: number;
}

export const NETWORK_GAS: {
  [chainId: number]: NetworkSpeed;
} = {
  [ChainId.Rinkeby]: {
    slow: 1.014229006,
    fast: 1.5,
    instant: 2.014229006,
  },
};
