import { createContext, useContext, useState } from "react";
import { IGlobalContext, MultiSenderPhase } from "../interfaces/IGlobalContext";

const globalContext = createContext<IGlobalContext>({
  multisender: {
    phase: "PREPERATION",
    setPhase: () => {},
  },
  wallet: {
    networkSwitcherOpen: false,
    setNetworkSwitcherOpen: () => {},
    walletSwitcherOpen: false,
    setWalletSwitcherOpen: () => {},
  },
});

export function useGlobalContext() {
  return useContext(globalContext);
}

export const GlobalContextProvider = globalContext.Provider;
