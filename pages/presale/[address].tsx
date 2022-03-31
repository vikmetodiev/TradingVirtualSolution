import { NextPage } from "next";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { SecondaryNavbar } from "../../components/navbar/navbarsecondary";
import { BuilderSidebar } from "../../components/sidebar/buildersidebar";
import { Widgets } from "../../components/widgets/widgets";
import { Contract, utils } from "ethers";
import presaleJSON from "../../abis/PresaleToken.json";
import {
  ERC20Interface,
  useContractCalls,
  useContractFunction,
  useEtherBalance,
  useEthers,
} from "@usedapp/core";
import { PresaleConfig } from "../../interfaces/solidity/PresaleConfig";
import useSingleData from "../../hooks/useSingleData";
import { BigNumber } from "ethers";
import { formatEther, formatUnits, parseEther } from "ethers/lib/utils";
import { NATIVE_CURRENCY } from "../../constants/networks";
import Countdown from "react-countdown";
import { toDateTimeString } from "../../utils/StringUtils";
import { useToasts } from "react-toast-notifications";

const { Interface } = utils;

interface Props {
  address: string;
  chainId: number;
}

const PresalePanel: NextPage<Props> = (props) => {
  const { account, library, chainId } = useEthers();

  const signer: any = useMemo(() => {
    if (!library) return null;
    return library.getSigner(account).connectUnchecked();
  }, [account, library]);

  const ethBalance = useEtherBalance(account);
  const { addToast, removeToast } = useToasts();

  const contractData = useMemo(
    () => ({
      abi: new Interface(presaleJSON.abi),
      address: props.address,
    }),
    [props.address]
  );

  const signedContract: any = useMemo(
    () =>
      !account || !library || props.address === ""
        ? null
        : new Contract(props.address, contractData.abi, signer),
    [account, library, contractData.abi, props.address]
  );

  const { state: withdrawState, send: withdrawFn } = useContractFunction(
    signedContract,
    "withdraw",
    { transactionName: "withdrawPresale" }
  );

  const [
    owner,
    presaleRate,
    tokenAddress,
    config,
    totalInvestment,
    myBalance,
    myInvestment,
  ] = useSingleData(
    useContractCalls([
      {
        ...contractData,
        method: "owner",
        args: [],
      },
      {
        ...contractData,
        method: "presaleRate",
        args: [],
      },
      {
        ...contractData,
        method: "tokenAddress",
        args: [],
      },
      {
        ...contractData,
        method: "config",
        args: [],
      },
      {
        ...contractData,
        method: "totalInvestment",
        args: [],
      },
      {
        ...contractData,
        method: "balanceOf",
        args: [account],
      },
      {
        ...contractData,
        method: "investmentOf",
        args: [account],
      },
    ])
  );

  const mappedConfig = useMemo(() => {
    if (!config) return null;
    return PresaleConfig.mapFromArray(config);
  }, [config]);

  const tokenContractData = useMemo(
    () =>
      tokenAddress
        ? {
            abi: ERC20Interface,
            address: tokenAddress,
          }
        : null,
    [tokenAddress]
  );

  const [tokenName, tokenSymbol, tokenDecimals, contractBalance] =
    useSingleData(
      useContractCalls([
        {
          ...tokenContractData,
          method: "name",
          args: [],
        },
        {
          ...tokenContractData,
          method: "symbol",
          args: [],
        },
        {
          ...tokenContractData,
          method: "decimals",
          args: [],
        },
        {
          ...tokenContractData,
          method: "balanceOf",
          args: [props.address],
        },
      ])
    );

  const presaleEndTime = useMemo(() => {
    if (!mappedConfig?.startTime || !mappedConfig?.presaleDays) return null;
    const daysToAdd = +mappedConfig.presaleDays.toString();
    return (
      (+mappedConfig.startTime.toString() + daysToAdd * 60 * 60 * 24) * 1000
    );
  }, [mappedConfig?.startTime, mappedConfig?.presaleDays]);

  const percentage = useMemo(() => {
    if (!mappedConfig?.hardCap || !totalInvestment) return null;
    return Math.floor(
      (totalInvestment / +mappedConfig.hardCap.toString()) * 100
    );
  }, [mappedConfig?.hardCap, totalInvestment]);

  const investInputRef = useRef<HTMLInputElement | null>(null);

  const onInvest = useCallback(() => {
    const amount = parseEther(investInputRef.current.value);
    const signer = library?.getSigner?.(account);
    if (!signer) {
      addToast("Please connect to wallet.", { appearance: "warning" });
      return;
    }
    signer
      .sendTransaction({
        to: props.address,
        chainId: props.chainId,
        value: amount,
      })
      .then((res) => {
        addToast("Sending fund.", {
          appearance: "info",
          id: "sendingFund",
          autoDismiss: false,
        });
        res
          .wait()
          .then((receipt) => {
            removeToast("sendingFund");
            addToast("Fund Sent. Tx Hash: " + receipt.transactionHash);
          })
          .catch((err) => {
            console.log("ERR: ", err);

            removeToast("sendingFund");
            addToast("Failed to send.");
          });
      })
      .catch((err) => {
        removeToast("sendingFund");
        addToast("Failed to send.");
      });
  }, [library, account, props.chainId, props.address]);

  useEffect(() => {
    if (withdrawState.status === "Success") {
      removeToast("withdrawing");
      addToast("Successfully Withdrawn.", { appearance: "success" });
    } else if (withdrawState.status === "Mining") {
      addToast("Withdrawing token.", {
        appearance: "info",
        autoDismiss: false,
        id: "withdrawing",
      });
    } else if (
      withdrawState.status === "Exception" ||
      withdrawState.status === "Fail"
    ) {
      removeToast("withdrawing");
      addToast("Failed to withdraw. Reason: " + withdrawState.errorMessage, {
        appearance: "error",
      });
    }
  }, [withdrawState]);

  return (
    <div id="wrapper">
      <SecondaryNavbar />

      <main id="main">
        <div className="container container-builder">
          <BuilderSidebar />

          <section className="minter">
            <div className="minter__left mw--100">
              {!tokenName || !tokenSymbol ? (
                <h1>
                  Presale <span>Token</span>
                </h1>
              ) : (
                <h1>
                  {tokenName} ({tokenSymbol}) <span>Presale Pool</span>
                </h1>
              )}
              <h3>IDO Contract: {props.address}</h3>
            </div>
            <div className="ps-wrap minter__left mw--100">
              <div className="ps-div">
                {!!mappedConfig?.hardCap &&
                  !!totalInvestment &&
                  !!tokenDecimals && (
                    <div>
                      Remaining Limit
                      <br />
                      <span>
                        {formatUnits(
                          (mappedConfig.hardCap as BigNumber).sub(
                            totalInvestment
                          ),
                          tokenDecimals
                        )}
                      </span>
                    </div>
                  )}
                {!!presaleRate && !!tokenDecimals && !!tokenSymbol && (
                  <div>
                    Exchange Proprotion
                    <br />
                    <span>
                      1 {NATIVE_CURRENCY[props.chainId].ticker} :{" "}
                      {formatUnits(presaleRate.toString(), tokenDecimals)}{" "}
                      {tokenSymbol}
                    </span>
                  </div>
                )}
              </div>
              <div className="ps-input-wrap">
                {!!ethBalance && (
                  <div>
                    Balance: {formatEther(ethBalance)}{" "}
                    {NATIVE_CURRENCY[chainId].ticker}
                  </div>
                )}
                <div className="ps-input">
                  <input type="number" defaultValue={0} ref={investInputRef} />
                  <button className="btn-basic" onClick={onInvest}>
                    Invest
                  </button>
                </div>
              </div>
              {!!presaleEndTime && (
                <div className="ps-countdown">
                  <h4>Presale Ends in</h4>
                  <Countdown date={presaleEndTime} />
                </div>
              )}
              {typeof contractBalance !== "undefined" &&
                typeof tokenDecimals !== "undefined" &&
                !!tokenSymbol && (
                  <div className="ps-alert">
                    Total Available:{" "}
                    {formatUnits(contractBalance, tokenDecimals)} {tokenSymbol}
                  </div>
                )}
              {percentage !== null && (
                <div className="ps-percent">
                  <div style={{ width: percentage + "%" }}>{percentage}%</div>
                </div>
              )}
              <div className="ps-info">
                <h3>Presale Info</h3>
                <ul>
                  {!!mappedConfig?.startTime && (
                    <li>
                      Start Time:
                      <span>
                        {toDateTimeString(
                          +mappedConfig.startTime.toString() * 1000
                        )}
                      </span>
                    </li>
                  )}
                  {!!presaleEndTime && (
                    <li>
                      End Time:<span>{toDateTimeString(presaleEndTime)}</span>
                    </li>
                  )}
                  {!!mappedConfig?.softCap && (
                    <li>
                      Soft Cap:
                      <span>
                        {formatEther(mappedConfig.softCap)}{" "}
                        {NATIVE_CURRENCY[props.chainId].ticker}
                      </span>
                    </li>
                  )}
                  {!!mappedConfig?.hardCap && (
                    <li>
                      Hard Cap:
                      <span>
                        {formatEther(mappedConfig.hardCap)}{" "}
                        {NATIVE_CURRENCY[props.chainId].ticker}
                      </span>
                    </li>
                  )}
                  {!!mappedConfig?.minContribution && (
                    <li>
                      Minimum Contribution:
                      <span>
                        {mappedConfig.minContribution.toString()}{" "}
                        {NATIVE_CURRENCY[props.chainId].ticker}
                      </span>
                    </li>
                  )}
                  {!!mappedConfig?.maxContribution && (
                    <li>
                      Maximum Contribution:
                      <span>
                        {mappedConfig.minContribution.toString()}{" "}
                        {NATIVE_CURRENCY[props.chainId].ticker}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="ps-info">
                <h3>Token Info</h3>
                <ul>
                  {!!tokenAddress && (
                    <li>
                      Address:<span>{tokenAddress}</span>
                    </li>
                  )}
                  {!!tokenName && (
                    <li>
                      Name:<span>{tokenName}</span>
                    </li>
                  )}
                  {!!tokenSymbol && (
                    <li>
                      Symbol:<span>{tokenSymbol}</span>
                    </li>
                  )}
                  {!!tokenDecimals && (
                    <li>
                      Decimals:<span>{tokenDecimals}</span>
                    </li>
                  )}
                </ul>
              </div>
              {!!account && (
                <div className="ps-info">
                  <h3>My Info</h3>
                  <ul>
                    {!!myBalance && !!tokenDecimals && !!tokenSymbol && (
                      <li>
                        My Balance:
                        <span>
                          {formatUnits(myBalance, tokenDecimals)} {tokenSymbol}
                        </span>
                      </li>
                    )}
                    {!!myInvestment && !!tokenDecimals && (
                      <li>
                        My Investment:
                        <span>
                          {formatEther(myInvestment)}{" "}
                          {NATIVE_CURRENCY[props.chainId].ticker}
                        </span>
                      </li>
                    )}
                  </ul>
                  {(myBalance as BigNumber).gt(0) ? (
                    <button
                      className="btn-basic"
                      onClick={() => {
                        withdrawFn();
                      }}
                    >
                      Withdraw
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <Widgets />
        </div>
      </main>
    </div>
  );
};

PresalePanel.getInitialProps = ({ query }) => {
  const addressSet = (query.address + "").split("-");
  const chainId = addressSet.pop();
  return {
    address: addressSet.pop(),
    chainId: +chainId,
  };
};

export default PresalePanel;
