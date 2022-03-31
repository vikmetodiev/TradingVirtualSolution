export interface IGlobalContext {
  multisender: IMultiSenderContext;
  wallet: IWalletContext;
}

export interface IMultiSenderContext {
  phase: MultiSenderPhase;
  setPhase: (phase: MultiSenderPhase) => void;
}

export interface IWalletContext {
  networkSwitcherOpen: boolean;
  setNetworkSwitcherOpen: (isOpen: boolean) => void;
  walletSwitcherOpen: boolean;
  setWalletSwitcherOpen: (isOpen: boolean) => void;
}

export type MultiSenderPhase = "PREPERATION" | "CONFIRMATION" | "MAILING";
