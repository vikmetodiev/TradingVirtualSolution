import { getChainName, shortenIfAddress, useEthers } from "@usedapp/core";
import React from "react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { isSupportedChainId } from "../../utils/NumberUtils";

export function BuilderWidgets(): JSX.Element {
  const { account, chainId } = useEthers();
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
            <p>
              You do not appear to be connect edto any Etheroum network, To use
              thissurvice and deplay your contract werecommend using the
              MetaMask plugin for Google Chrome, whichallows your web trowser to
              connect an Ethereum network
            </p>
          </div>
        </div>
      ) : (
        <div className="meta__header">
          <button style={{ justifyContent: "center", marginBottom: 5 }}>
            {shortenIfAddress(account)}
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
