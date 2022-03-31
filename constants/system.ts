import { ChainId } from "@usedapp/core";

export const NFT_META_ROOT =
  "https://deepchainlab.com:3333/api/nft/metadata/" as const;

export const IMGUR_CLIENT_ID = process.env.REACT_APP_IMGUR_CID;

export const SYSTEM_ADDRESS: {
  [chainId: number]: string;
} = {
  [ChainId.Rinkeby]: "0x237317f69EF91bFb79baD347A40a82A5dc0800d1",
};

export const TOKEN_DEPLOY_CHARGE: {
  [chainId: number]: string;
} = {
  [ChainId.Rinkeby]: "0.01",
};

export const PRESALE_DEPLOY_CHARGE: {
  [chainId: number]: string;
} = {
  [ChainId.Rinkeby]: "0.01",
};

export const NFT_DEPLOY_CHARGE: {
  [chainId: number]: string;
} = {
  [ChainId.Rinkeby]: "0.01",
};
