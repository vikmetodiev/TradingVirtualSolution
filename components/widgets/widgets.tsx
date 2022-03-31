/* eslint-disable @next/next/no-img-element */
import { useEthers, shortenAddress, getChainName } from "@usedapp/core";
import React from "react";
import { SUPPORTED_CHAIN_IDS } from "../../constants/networks";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import {
  getSupportedChainId,
  isSupportedChainId,
} from "../../utils/NumberUtils";
import NetworkModal from "../shared/NetworkModal";

export function Widgets(): JSX.Element {
  const { deactivate, account, chainId, error } = useEthers();
  const { wallet } = useGlobalContext();

  return (
    <div className="meta">
      {!account ? (
        <div className="meta__box">
          <div className="meta__header">
            <button onClick={() => wallet.setWalletSwitcherOpen(true)}>
              <img src="/icons/cat.png" alt="Cat" /> CONNECT WALLET
            </button>
          </div>

          <div className="meta__text">
            {!error ? (
              <p>
                You do not appear to be connect edto any Etheroum network, To
                use thissurvice and deplay your contract werecommend using the
                MetaMask plugin for Google Chrome, whichallows your web trowser
                to connect an Ethereum network
              </p>
            ) : (
              <p style={{ color: "#bb3939" }}>
                {error.name === "UnsupportedChainIdError"
                  ? `Unsupported network. Please switch to one of the following networks: ${SUPPORTED_CHAIN_IDS.map(
                      (cid) => getChainName(cid)
                    ).join(", ")}`
                  : error.message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="meta__header">
          <button
            style={{ justifyContent: "center", marginBottom: 5 }}
            onClick={() => {
              deactivate();
            }}
          >
            {shortenAddress(account)}
          </button>
          <button
            className={isSupportedChainId(chainId) ? undefined : "error-btn"}
            style={{ textAlign: "center" }}
            onClick={() => {
              wallet.setNetworkSwitcherOpen(true);
            }}
          >
            NETWORK: {getChainName(chainId)}
          </button>
        </div>
      )}
    </div>
  );
}
