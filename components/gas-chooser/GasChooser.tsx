import { formatEther, formatUnits, parseUnits } from "@ethersproject/units";
import {
  useContractFunction,
  useEtherBalance,
  useEthers,
  useTransactions,
} from "@usedapp/core";
import { BigNumber, Contract, utils, BigNumberish } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import { NATIVE_CURRENCY, NETWORK_GAS } from "../../constants/networks";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { IGasData } from "../../interfaces/IGasData";
import {
  getCharge,
  getSignificant,
  getSupportedChainId,
} from "../../utils/NumberUtils";
const apiKey = process.env.DEFIPULSE_API_KEY;

export default function GasChooser({
  contract,
  fnName,
  args,
  onConfirm,
}: {
  contract?: Contract;
  fnName?: string;
  args?: any[];
  onConfirm: (gas: IGasData) => void;
}) {
  const { library, chainId, account } = useEthers();
  const [gas, setGas] = useState<number>(
    NETWORK_GAS[getSupportedChainId(chainId)].fast
  );
  const [stdGas, setStdGas] = useState<BigNumber>(BigNumber.from(0));
  // const [maxGas, setMaxGas] = useState("10");
  const { multisender } = useGlobalContext();
  const nativeBalance = useEtherBalance(account);

  // useEffect(() => {
  //   fetch("https://ethgasstation.info/api/ethgasAPI.json?api-key=" + apiKey)
  //     .then((res) => res.json())
  //     .then((res) => {
  //       console.log("RES: ", res);
  //     });
  // }, []);

  useEffect(() => {
    if (contract && fnName)
      contract.estimateGas[fnName](...args).then((g) => {
        setStdGas(g);
        // setMaxGas(utils.formatUnits(g.add(BigNumber.from(10 ** 10)), 10));
      });
  }, [library, contract, fnName, args]);

  return (
    <div className="token__chat" style={{ height: "30rem" }}>
      <>
        <div className="token__chat--box">
          <p>Network speed</p>
        </div>
        <div className="gas__range">
          <input
            type="range"
            min={NETWORK_GAS[getSupportedChainId(chainId)].slow}
            value={gas}
            max={NETWORK_GAS[getSupportedChainId(chainId)].instant}
            step={
              (NETWORK_GAS[getSupportedChainId(chainId)].instant -
                NETWORK_GAS[getSupportedChainId(chainId)].slow) /
              20
            }
            onChange={(e) => {
              setGas(+e.currentTarget.value);
            }}
            style={{ width: "100%" }}
          />
          <span>Slow</span>
          <span>Fast</span>
          <span>Instant</span>
        </div>
        <div className="summary">
          <ul>
            <li>
              <strong>{1}</strong>
              <div>Number of transaction needed</div>
            </li>
            <li>
              <strong>
                {getSignificant(formatEther(nativeBalance))}{" "}
                {NATIVE_CURRENCY[chainId].ticker}
              </strong>
              <div>Your {NATIVE_CURRENCY[chainId].ticker} balance</div>
            </li>
            <li>
              <strong>{gas} GWEI</strong>
              <div>Gas to Provide</div>
            </li>
            <li>
              <strong>
                {getSignificant(
                  (
                    getCharge(
                      Array.isArray(args[0]) ? args[0].length : args[1].length
                    ) + +formatEther(stdGas.mul(parseUnits(gas.toString(), 9)))
                  ).toString()
                )}{" "}
                {NATIVE_CURRENCY[chainId].ticker}
              </strong>
              <div>Total cost of operation</div>
            </li>
          </ul>
        </div>

        <div className="token__chat--btns">
          <button
            className="btn-attach"
            onClick={() => multisender.setPhase("PREPERATION")}
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
          <button
            className="btn-send"
            onClick={() => {
              onConfirm({
                gasLimit: stdGas,
                maxFeePerGas: parseUnits(gas.toString(), "gwei").add(1000),
                maxPriorityFeePerGas: parseUnits(gas.toString(), "gwei"),
              });
            }}
          >
            CONTINUE
            <svg>
              <use xlinkHref="/icons/sprite.svg#icon-telegram"></use>
            </svg>
          </button>
        </div>
      </>
    </div>
  );
}
