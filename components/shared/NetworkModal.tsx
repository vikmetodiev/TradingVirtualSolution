import { getChainName, useEthers } from "@usedapp/core";
import React, { useState } from "react";
import { NETWORK_ITEMS, SUPPORTED_CHAIN_IDS } from "../../constants/networks";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import Modal from "../modal/Modal";

export default function NetworkModal() {
  const { wallet } = useGlobalContext();
  const { chainId, library } = useEthers();

  const addNewNetwork = (chainId: number) => {
    console.log("New Network");

    library?.provider
      ?.request?.({
        method: "wallet_addEthereumChain",
        params: [NETWORK_ITEMS[chainId]],
      })
      .then(() => {
        networkSwitchHandler(chainId);
      });
  };

  const networkSwitchHandler = (network: number) => {
    if (library) {
      library.provider
        .request?.({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: NETWORK_ITEMS[network].chainId,
            },
          ],
        })
        .then(() => {
          wallet.setNetworkSwitcherOpen(false);
        })
        .catch((err) => {
          if (err.code === 4902) {
            addNewNetwork(network);
          } else {
            console.error(err);
          }
        });
    }
  };

  return (
    <>
      <Modal
        open={wallet.networkSwitcherOpen}
        onClose={() => {
          wallet.setNetworkSwitcherOpen(false);
        }}
        title="Select Network"
      >
        <ul className="network-options">
          {SUPPORTED_CHAIN_IDS.map((chain, idx) => (
            <li
              key={idx}
              className={chainId == chain ? "active" : undefined}
              onClick={() => {
                networkSwitchHandler(chain);
              }}
            >
              {getChainName(chain)}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
