import "../styles/theme.css";
import "../styles/style.css";
import type { AppProps } from "next/app";
import { DAppProvider } from "@usedapp/core";
import { DAPP_CONFIG } from "../constants/networks";
import { GlobalContextProvider } from "../hooks/useGlobalContext";
import { useState } from "react";
import { MultiSenderPhase } from "../interfaces/IGlobalContext";
import NetworkModal from "../components/shared/NetworkModal";
import WalletSelectorModal from "../components/shared/WalletSelectorModal";
import { ToastProvider } from "react-toast-notifications";

function MyApp({ Component, pageProps }: AppProps) {
  const [multiSenderPhase, setMultiSenderPhase] =
    useState<MultiSenderPhase>("PREPERATION");
  const [networkSwitcherOpen, setNetworkSwitcherOpen] = useState(false);
  const [walletSwitcherOpen, setWalletSwitcherOpen] = useState(false);

  return (
    <DAppProvider config={DAPP_CONFIG}>
      <GlobalContextProvider
        value={{
          multisender: {
            phase: multiSenderPhase,
            setPhase: setMultiSenderPhase,
          },
          wallet: {
            networkSwitcherOpen,
            setNetworkSwitcherOpen,
            walletSwitcherOpen,
            setWalletSwitcherOpen,
          },
        }}
      >
        <ToastProvider autoDismiss={true}>
          <Component {...pageProps} />
        </ToastProvider>
        <WalletSelectorModal />
        <NetworkModal />
      </GlobalContextProvider>
    </DAppProvider>
  );
}

export default MyApp;
