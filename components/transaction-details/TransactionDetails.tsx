import {
  getExplorerTransactionLink,
  TransactionStatus,
  useEthers,
} from "@usedapp/core";
import React from "react";
import Link from "next/link";
import { useGlobalContext } from "../../hooks/useGlobalContext";

export default function TransactionDetails({
  txState,
  onResend,
}: {
  txState: TransactionStatus;
  onResend: () => void;
}) {
  const { chainId } = useEthers();
  const { multisender } = useGlobalContext();

  return (
    <>
      <div className="token__chat">
        <div className="token__chat--box">
          <div className="box">
            Sending Tokens Hash{" "}
            {txState.transaction?.hash ? (
              <Link
                href={getExplorerTransactionLink(
                  txState.transaction.hash,
                  chainId
                )}
              >
                <a target="_blank">{txState.transaction.hash}</a>
              </Link>
            ) : null}{" "}
            <span>
              {txState.status === "Success" ? (
                "✅"
              ) : txState.status === "Fail" ||
                txState.status === "Exception" ? (
                "⛔"
              ) : (
                <div className="loading"></div>
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="token__chat--btns">
        <button
          className="btn-attach"
          onClick={() => multisender.setPhase("CONFIRMATION")}
        >
          <svg
            style={{
              transform: "rotate(180deg)",
              marginLeft: 0,
              marginRight: "1.4rem",
            }}
          >
            <use xlinkHref="/icons/sprite.svg#icon-arrow-right"></use>
          </svg>
          BACK
        </button>
        {txState.status === "Fail" || txState.status === "Exception" ? (
          <button
            className="btn-send"
            onClick={() => {
              onResend();
            }}
          >
            RESEND
            <svg>
              <use xlinkHref="/icons/sprite.svg#icon-telegram"></use>
            </svg>
          </button>
        ) : null}
      </div>
    </>
  );
}
