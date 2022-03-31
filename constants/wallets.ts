import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { NODE_URLS, SUPPORTED_CHAIN_IDS } from "./networks";

export const injectedConnector = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
});

export const walletconnectConnector = new WalletConnectConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
  rpc: NODE_URLS,
  qrcode: true,
  bridge: process.env.REACT_APP_WALLETCONNECT_BRIDGE_URL,
});

export const SUPPORTED_WALLETS = {
  INJECTED: {
    connector: injectedConnector,
    name: "Injected",
    description: "Injected web3 provider.",
    href: null,
    color: "#010101",
    primary: true,
    logo: "",
  },
  METAMASK: {
    connector: injectedConnector,
    name: "MetaMask",
    description: "Easy-to-use browser extension.",
    href: null,
    color: "#E8831D",
    logo: "/icons/cat.png",
  },
  WALLET_CONNECT: {
    connector: walletconnectConnector,
    name: "WalletConnect",
    description: "Connect to Trust Wallet, Rainbow Wallet and more...",
    href: null,
    color: "#4196FC",
    mobile: true,
    logo: "",
  },
};
