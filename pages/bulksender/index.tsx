/* eslint-disable @next/next/no-img-element */
import {
    Token,
    useEthers,
    useTokenBalance,
    ERC20Interface,
    useContractCalls,
    useTokenAllowance,
    useContractFunction,
    useEtherBalance,
    useGasPrice,
  } from "@usedapp/core";
  import type { NextPage } from "next";
  import Head from "next/head";
  import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  import { Navbar } from "../../components/navbar/navbar";
  import { Sidebar } from "../../components/sidebar/sidebar";
  import { Widgets } from "../../components/widgets/widgets";
  import { Footer } from "../../components/footer";
  import {
    ADDRESS_LIST_INPUT_FORMATS,
    MultiSenderInterface,
    MULTISENDER_ADDRESS,
    ZERO_ADDRESS,
  } from "../../constants/multisender";
  import { AddressMap } from "../../interfaces/IAddressMap";
  import { mapAddresses } from "../../utils/StringUtils";
  import CodeMirror from "@uiw/react-codemirror";
  import { formatUnits, parseEther, parseUnits } from "@ethersproject/units";
  import { useGlobalContext } from "../../hooks/useGlobalContext";
  import { ApprovalOption } from "../../interfaces/ApprovalOption";
  import { Contract, Signer } from "ethers";
  import { getCharge, getSupportedChainId } from "../../utils/NumberUtils";
  import GasChooser from "../../components/gas-chooser/GasChooser";
  import { NATIVE_CURRENCY } from "../../constants/networks";
  import { BigNumber } from "ethers";
  import TransactionDetails from "../../components/transaction-details/TransactionDetails";
  import { IGasData } from "../../interfaces/IGasData";
  
  const BulkSender: NextPage = () => {
    const uploaderRef = useRef<HTMLInputElement | null>(null);
    const addressInputRef = useRef<HTMLInputElement | null>(null);
    const { account, chainId, library } = useEthers();
  
    const signer: any = useMemo(() => {
      if (!library) return null;
      return library.getUncheckedSigner(account);
    }, [library, account]);
  
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        let format = "txt";
        if (file.name.endsWith("csv")) format = "csv";
        file.text().then((data) => {
          setInputText(data.replace(/;/g, ","));
        });
      }
    };
  
    const [tokenAddress, setTokenAddress] = useState("");
    const [inputText, setInputText] = useState("");
    const [substate, setSubstate] = useState<"" | "GAS">("");
  
    const [addressMapping, setAddressMapping] = useState<AddressMap>({});
  
    const gasPrice = useGasPrice();
  
    const globalContext = useGlobalContext();
  
    useEffect(() => {
      setAddressMapping(mapAddresses(inputText, "txt"));
    }, [inputText]);
  
    const [token, setToken] = useState<Token | undefined>(undefined);
    const balance = useTokenBalance(token?.address, account);
    const nativeBalance = useEtherBalance(account);
    const contractData = useContractCalls([
      {
        abi: ERC20Interface,
        address: tokenAddress ?? "",
        method: "name",
        args: [],
      },
      {
        abi: ERC20Interface,
        address: tokenAddress ?? "",
        method: "symbol",
        args: [],
      },
      {
        abi: ERC20Interface,
        address: tokenAddress ?? "",
        method: "decimals",
        args: [],
      },
    ]);
    const allowance = useTokenAllowance(
      tokenAddress,
      account,
      MULTISENDER_ADDRESS[getSupportedChainId(chainId)]
    );
  
    const [lastGas, setLastGas] = useState<IGasData>({
      gasLimit: BigNumber.from(0),
      maxFeePerGas: BigNumber.from(0),
    });
  
    useEffect(() => {
      if (tokenAddress && contractData) {
        if (tokenAddress === ZERO_ADDRESS) {
          setToken({
            ...NATIVE_CURRENCY[getSupportedChainId(chainId)],
            format: (_) => "0",
            address: ZERO_ADDRESS,
          });
        } else {
          setToken({
            address: tokenAddress,
            chainId: getSupportedChainId(chainId),
            decimals: contractData?.[2]?.[0] ?? 18,
            name: contractData?.[0]?.[0] ?? "Unknown Token",
            ticker: contractData?.[1]?.[0] ?? "--",
            format: (v) => v,
            formattingOptions: {
              decimals: contractData?.[2]?.[0] ?? 18,
              decimalSeparator: ".",
              fixedPrecisionDigits: 3,
              prefix: "",
              suffix: "",
              significantDigits: 4,
              thousandSeparator: ",",
              useFixedPrecision: false,
            },
          });
        }
      }
    }, [chainId, contractData, tokenAddress]);
  
    const onContinue = () => {
      const addresses = Object.keys(addressMapping);
      if (addresses.length > 0) {
        globalContext.multisender.setPhase("CONFIRMATION");
      }
    };
  
    const totalAmount = useMemo(
      () =>
        Object.keys(addressMapping).reduce(
          (prev, curr) => prev + (curr ? +addressMapping[curr] : 0),
          0
        ),
      [addressMapping]
    );
  
    const tokenContract: any = useMemo(
      () =>
        new Contract(
          token?.address ?? "0x4Bc0fad64DE3b6b6c9F8b490CE8752801D0B8d49",
          ERC20Interface,
          signer
        ),
      [token?.address, library]
    );
  
    const mainContract: any = useMemo(
      () =>
        new Contract(
          MULTISENDER_ADDRESS[getSupportedChainId(chainId)],
          MultiSenderInterface,
          signer
        ),
      [chainId]
    );
  
    const { state: approveState, send: approveCallback } = useContractFunction(
      tokenContract,
      "approve"
    );
  
    const onApprove = useCallback(() => {
      approveCallback(
        MULTISENDER_ADDRESS[getSupportedChainId(chainId)],
        parseUnits(totalAmount.toString(), token?.decimals ?? 18),
        { from: account }
      );
    }, [approveCallback, totalAmount, token?.decimals, account, chainId]);
  
    const [approvalOption, setApprovalOption] = useState<ApprovalOption>(
      ApprovalOption.Exact
    );
  
    const { send: multiSend, state: multisendState } = useContractFunction(
      mainContract,
      token?.address === ZERO_ADDRESS ? "sendNative" : "sendToken",
      {
        transactionName: "multisend",
        signer,
      }
    );
  
    const multiSendFn = (gas: IGasData) => {
      multiSend(
        ...(token?.address === ZERO_ADDRESS
          ? [
              Object.keys(addressMapping),
              Object.values(addressMapping).map((v) =>
                parseUnits(v, token.decimals)
              ),
              {
                value: parseEther(
                  (
                    getCharge(Object.keys(addressMapping).length) + totalAmount
                  ).toString()
                ),
                from: account,
                ...gas,
              },
            ]
          : [
              token.address,
              Object.keys(addressMapping),
              Object.values(addressMapping).map((v) =>
                parseUnits(v, token.decimals)
              ),
              {
                value: parseEther(
                  getCharge(Object.keys(addressMapping).length).toString()
                ),
                from: account,
                ...gas,
              },
            ])
      );
      globalContext.multisender.setPhase("MAILING");
    };
  
    return (
      <div id="wrapper" className="bulk-wrapper">
        <Head>
          <title>Virtual Trading Solutions</title>
          <meta name="description" content="Virtual Trading Solutions website." />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <Navbar showProgress={true} buttonClass={"bulk-button"}/>
        <img src="/images/bg-3.png" className="auditing-bg-image"/>
        <main id="main">
          <div className="container">
            <Sidebar />
  
            <section className="token">
              <h1 className="token__heading">
                Token <span>BulkSender</span>
              </h1>
  
              <div className="token__bar">
                <div className="token__search">
                  <label htmlFor="search-coin">
                    Address Token:{" "}
                    {token ? (
                      <>
                        {tokenAddress === ZERO_ADDRESS
                          ? `${
                              NATIVE_CURRENCY[getSupportedChainId(chainId)]?.name
                            } (
                        ${NATIVE_CURRENCY[getSupportedChainId(chainId)]?.ticker})`
                          : token.name}{" "}
                        - Balance:{" "}
                        {formatUnits(
                          (tokenAddress === ZERO_ADDRESS
                            ? nativeBalance?.toString?.()
                            : balance?.toString?.()) ?? "0",
                          tokenAddress === ZERO_ADDRESS
                            ? NATIVE_CURRENCY[getSupportedChainId(chainId)]
                                ?.decimals ?? 18
                            : token.decimals
                        )}
                      </>
                    ) : null}
                  </label>
                  <div className="token__search--input">
                    <svg>
                      <use xlinkHref="/icons/sprite.svg#icon-search"></use>
                    </svg>
                    <input
                      type="text"
                      name=""
                      id="search-coin"
                      placeholder="Search"
                      ref={addressInputRef}
                      disabled={globalContext.multisender.phase !== "PREPERATION"}
                    />
                    <ul className="dropdown">
                      <li
                        onClick={() => {
                          addressInputRef.current.value = ZERO_ADDRESS;
                          setTokenAddress(ZERO_ADDRESS);
                        }}
                      >
                        {NATIVE_CURRENCY[getSupportedChainId(chainId)].name} (
                        {NATIVE_CURRENCY[getSupportedChainId(chainId)].ticker})
                      </li>
                    </ul>
                    <button
                      type="submit"
                      onClick={() => {
                        setTokenAddress(addressInputRef.current?.value ?? "");
                      }}
                    >
                      SEARCH
                    </button>
                  </div>
                </div>
  
                <div className="token__fractional">
                  <button>
                    <span>Fractional</span>
                    <span>{token?.decimals ?? 18}</span>
                  </button>
                </div>
  
                <div className="token__toggle">
                  <p>Deflationary</p>
  
                  <div className="toggle">
                    <input type="checkbox" name="" id="toggle" />
                    <label htmlFor="toggle">
                      <span className="toggle-inner"></span>
                      <span className="toggle-button"></span>
                    </label>
                  </div>
                </div>
              </div>
  
              {globalContext.multisender.phase === "PREPERATION" ? (
                <div className="token__chat">
                  <div className="token__chat--box">
                    <p>List of addresses in CSV format</p>
                    <a href="/example.csv" download>
                      <button>Example CSV</button>
                    </a>
                  </div>
                  <div className="input--addresses">
                    <CodeMirror
                      value={inputText}
                      onChange={(val, vu) => {
                        setInputText(val);
                      }}
                      theme="dark"
                      height="170px"
                    />
                  </div>
  
                  <div className="token__chat--btns">
                    <input
                      ref={uploaderRef}
                      type="file"
                      multiple={false}
                      style={{ display: "none" }}
                      accept={ADDRESS_LIST_INPUT_FORMATS}
                      onChange={onInputChange}
                    />
                    <button
                      className="btn-attach"
                      onClick={() => uploaderRef.current?.click?.()}
                    >
                      ATTACH
                      <svg>
                        <use xlinkHref="/icons/sprite.svg#icon-file"></use>
                      </svg>
                    </button>
  
                    <button
                      className="btn-send"
                      onClick={onContinue}
                      disabled={Object.keys(addressMapping).length <= 0 && !token}
                    >
                      CONTINUE
                      <svg>
                        <use xlinkHref="/icons/sprite.svg#icon-telegram"></use>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}
              {globalContext.multisender.phase === "CONFIRMATION" &&
              substate === "" ? (
                <div className="token__chat">
                  <div className="token__chat--box">
                    <p>Summary</p>
                  </div>
                  <div className="summary">
                    <ul>
                      <li>
                        <strong>{Object.keys(addressMapping).length}</strong>
                        <div>Total Recipeints</div>
                      </li>
                      <li>
                        <strong>{totalAmount}</strong>
                        <div>Total Amount</div>
                      </li>
                      <li>
                        <strong>
                          {token?.address === ZERO_ADDRESS
                            ? formatUnits(
                                nativeBalance,
                                NATIVE_CURRENCY[getSupportedChainId(chainId)]
                                  ?.decimals
                              )
                            : formatUnits(balance ?? 0, token?.decimals)}
                        </strong>
                        <div>Current Token Balance</div>
                      </li>
                      {token?.address !== ZERO_ADDRESS && (
                        <li>
                          <strong>
                            {formatUnits(allowance ?? 0, token?.decimals)}{" "}
                            {token?.ticker}
                          </strong>
                          <div>Current Allowance</div>
                        </li>
                      )}
                      {/* <li><strong>{Object.keys(addressMapping).filter(a => !!a).length}</strong><div>Number of Recipients</div></li> */}
                    </ul>
                    {token?.address !== ZERO_ADDRESS && (
                      <div style={{ fontSize: "14px", marginTop: 10 }}>
                        Approval Options:
                        <br />
                        <div className="app-select">
                          <div
                            className="app-opt"
                            onClick={(e) => {
                              setApprovalOption(ApprovalOption.Exact);
                              const inp = e.currentTarget
                                .children[0] as HTMLInputElement;
                              inp.checked = true;
                            }}
                          >
                            <input
                              type="radio"
                              name="approvalOption"
                              checked={approvalOption === ApprovalOption.Exact}
                            />{" "}
                            Exact Amount
                          </div>
                          <div
                            className="app-opt"
                            onClick={(e) => {
                              setApprovalOption(ApprovalOption.Full);
                              const inp = e.currentTarget
                                .children[0] as HTMLInputElement;
                              inp.checked = true;
                            }}
                          >
                            <input
                              type="radio"
                              name="approvalOption"
                              checked={approvalOption === ApprovalOption.Full}
                            />{" "}
                            Full Balance
                          </div>
                        </div>
                      </div>
                    )}
                    {approveState.transaction && (
                      <div className="box">
                        {approveState.status === "Mining" ? (
                          <>
                            Approve transaction hash{" "}
                            {approveState.transaction.hash}
                            <div className="loading"></div>
                          </>
                        ) : null}
                        {approveState.status === "Success" ? (
                          <>
                            Approve transaction hash{" "}
                            {approveState.transaction.hash}
                            <div>✅</div>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
  
                  <div className="token__chat--btns">
                    <button
                      className="btn-attach"
                      onClick={() =>
                        globalContext.multisender.setPhase("PREPERATION")
                      }
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
  
                    {token?.address === ZERO_ADDRESS ||
                    (allowance &&
                      allowance.gte(
                        parseUnits(totalAmount.toString(), token.decimals)
                      )) ? (
                      <button
                        className="btn-send"
                        onClick={() => {
                          setSubstate("GAS");
                        }}
                      >
                        CONTINUE
                        <svg>
                          <use xlinkHref="/icons/sprite.svg#icon-telegram"></use>
                        </svg>
                      </button>
                    ) : (
                      <button
                        className="btn-send"
                        onClick={() => {
                          onApprove();
                        }}
                      >
                        APPROVE
                        <svg>
                          <use xlinkHref="/icons/sprite.svg#icon-telegram"></use>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
              {globalContext.multisender.phase === "CONFIRMATION" &&
              substate === "GAS" ? (
                <GasChooser
                  contract={mainContract}
                  fnName={
                    token?.address === ZERO_ADDRESS ? "sendNative" : "sendToken"
                  }
                  args={
                    token?.address === ZERO_ADDRESS
                      ? [
                          Object.keys(addressMapping),
                          Object.values(addressMapping).map((v) =>
                            parseUnits(v, token.decimals)
                          ),
                          {
                            value: parseUnits(
                              (
                                getCharge(Object.keys(addressMapping).length) +
                                totalAmount
                              ).toString(),
                              18
                            ),
                          },
                        ]
                      : [
                          token.address,
                          Object.keys(addressMapping),
                          Object.values(addressMapping).map((v) =>
                            parseUnits(v, token.decimals)
                          ),
                          {
                            value: parseUnits(
                              getCharge(
                                Object.keys(addressMapping).length
                              ).toString(),
                              18
                            ),
                          },
                        ]
                  }
                  onConfirm={(gas) => {
                    multiSendFn(gas);
                    setLastGas(gas);
                  }}
                />
              ) : null}
              {globalContext.multisender.phase === "MAILING" ? (
                <div className="token__chat" style={{ height: "30rem" }}>
                  <div className="token__chat--box">
                    <p>Result</p>
                  </div>
                  <TransactionDetails
                    txState={multisendState}
                    onResend={() => {
                      multiSendFn(lastGas);
                    }}
                  />
                </div>
              ) : null}
  
              <div className="multi">
                <h2>MultiSender supports the following networks:</h2>
  
                <hr />
  
                <div className="multi__content">
                  <div className="multi__content--box">
                    <img src="/icons/eth.png" alt="" />
                    <p>
                      <span>Ethereum</span>
                      <span>Mainnet</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/binance.png" alt="" />
                    <p>
                      <span>Binance</span>
                      <span>Smart Chain</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/arb.png" alt="" />
                    <p>
                      <span>Arbitrum</span>
                      <span>One</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/avala.png" alt="" />
                    <p>
                      <span>Avalanche</span>
                      <span>C Chain</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/fantom.png" alt="" />
                    <p>
                      <span>Fantom</span>
                      <span>Opera</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/iotex.png" alt="" />
                    <p>
                      <span>IOTEX</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/matic.png" alt="" />
                    <p>
                      <span>Matic</span>
                      <span>Network</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/poa.png" alt="" />
                    <p>
                      <span>POA</span>
                      <span>Network</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/xdai.png" alt="" />
                    <p>
                      <span>XDAI</span>
                    </p>
                  </div>
  
                  <div className="multi__content--box">
                    <img src="/icons/moon.png" alt="" />
                    <p>
                      <span>Moonriver</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>
  
            <Widgets />
          </div>
        </main>
        <div className="bulk-footer">
        <Footer />
        </div>
      </div>
    );
  };
  
  export default BulkSender;
  