import { getChainName, useEthers } from "@usedapp/core";
import React, { useState } from "react";
import { SUPPORTED_WALLETS } from "../../constants/wallets";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import Modal from "../modal/Modal";

export default function WalletSelectorModal() {
  const { wallet } = useGlobalContext();
  const { activate } = useEthers();

  return (
    <>
      <Modal
        open={wallet.walletSwitcherOpen}
        onClose={() => {
          wallet.setWalletSwitcherOpen(false);
        }}
        title="Select Wallet"
      >
        <ul className="network-options">
          {Object.keys(SUPPORTED_WALLETS).map((key) => (
            <li
              key={key}
              onClick={async () => {
                await activate(SUPPORTED_WALLETS[key].connector);
                wallet.setWalletSwitcherOpen(false);
              }}
            >
              {SUPPORTED_WALLETS[key].name}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
