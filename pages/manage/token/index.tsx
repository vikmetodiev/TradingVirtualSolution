import { NextPage } from "next";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SecondaryNavbar } from "../../../components/navbar/navbarsecondary";
import { BuilderSidebar } from "../../../components/sidebar/buildersidebar";
import { Widgets } from "../../../components/widgets/widgets";
import {
  ERC20Interface,
  useContractCalls,
  useEthers,
  useContractFunction,
} from "@usedapp/core";
import { useRouter } from "next/dist/client/router";
import CustomERC20 from "../../../abis/CustomERC20.json";
import { Contract, utils } from "ethers";
import { ITokenManageConfig } from "../../../interfaces/ITokenManageConfig";
import { useToasts } from "react-toast-notifications";

const { formatUnits, parseUnits, Interface, isAddress } = utils;

const ManageTokenIndex: NextPage = (props) => {
  const { account, library } = useEthers();
  const { query, replace } = useRouter();
  const [searchToken, setSearchToken] = useState("");
  const [configSet, setConfigSet] = useState<ITokenManageConfig>({
    changeOwner: undefined,
    mint: undefined,
    burn: undefined,
  });
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { addToast } = useToasts();

  const onAddToken = () => {
    const tokenAddress = searchRef.current.value;
    if (isAddress(tokenAddress)) {
      setSearchToken(tokenAddress);
      replace(`/manage/token?address=${tokenAddress}`);
    } else {
      alert("Invalid Address");
    }
  };

  const customTokenInterface = useMemo(
    () => new Interface(CustomERC20.abi),
    []
  );

  const customTokenContract: any = useMemo(() => {
    if (isAddress(searchToken)) {
      const signer: any = library?.getSigner?.(account);
      return new Contract(searchToken, customTokenInterface, signer);
    }
    return undefined;
  }, [searchToken, customTokenInterface, library]);

  useEffect(() => {
    if (query?.address) {
      setSearchToken(query.address + "");
    }
  }, [query?.address]);

  const [
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenTotalSupply,
    tokenBalance,
    tokenOwner,
    tokenTxFee,
    tokenLiquidityFee,
  ] = useContractCalls([
    {
      abi: ERC20Interface,
      address: searchToken,
      method: "name",
      args: [],
    },
    {
      abi: ERC20Interface,
      address: searchToken,
      method: "symbol",
      args: [],
    },
    {
      abi: ERC20Interface,
      address: searchToken,
      method: "decimals",
      args: [],
    },
    {
      abi: ERC20Interface,
      address: searchToken,
      method: "totalSupply",
      args: [],
    },
    {
      abi: ERC20Interface,
      address: searchToken,
      method: "balanceOf",
      args: [account],
    },
    {
      abi: customTokenInterface,
      address: searchToken,
      method: "owner",
      args: [],
    },
    {
      abi: customTokenInterface,
      address: searchToken,
      method: "_taxFee",
      args: [],
    },
    {
      abi: customTokenInterface,
      address: searchToken,
      method: "_liquidityFee",
      args: [],
    },
  ]);

  const { state: burnState, send: burnFn } = useContractFunction(
    customTokenContract,
    "burn",
    { signer: library?.getSigner?.(account) }
  );
  const { state: mintState, send: mintFn } = useContractFunction(
    customTokenContract,
    "mint",
    { signer: library?.getSigner?.(account) }
  );
  const { state: transferOwnershipState, send: transferOwnershipFn } =
    useContractFunction(customTokenContract, "transferOwnership", {
      signer: library?.getSigner?.(account),
    });

  useEffect(() => {
    if (transferOwnershipState.status === "Success") {
      setConfigSet((c) => ({
        ...c,
        changeOwner: undefined,
      }));
    }
  }, [transferOwnershipState]);

  useEffect(() => {
    if (transferOwnershipState.errorMessage) {
      addToast(transferOwnershipState.errorMessage, {
        appearance: "error",
      });
    }
  }, [transferOwnershipState]);

  useEffect(() => {
    if (mintState.errorMessage) {
      if (mintState.errorMessage.startsWith("missing argument")) {
        addToast("Mint is no enabled for this token", {
          appearance: "error",
        });
      } else
        addToast(mintState.errorMessage, {
          appearance: "error",
        });
    }
  }, [mintState]);

  useEffect(() => {
    if (burnState.errorMessage) {
      if (burnState.errorMessage.startsWith("missing argument")) {
        addToast("Burn is no enabled for this token", {
          appearance: "error",
        });
      } else
        addToast(burnState.errorMessage, {
          appearance: "error",
        });
    }
  }, [burnState]);

  return (
    <div id="wrapper">
      <SecondaryNavbar />

      <main id="main">
        <div className="container container-builder">
          <BuilderSidebar />

          <section className="minter">
            <div className="minter__left mw--100">
              <h1>
                Token <span>Manager</span>
              </h1>
              <div className="token__search">
                <label htmlFor="search-coin">Address Token:</label>
                <div className="token__search--input">
                  <svg>
                    <use xlinkHref="/icons/sprite.svg#icon-search"></use>
                  </svg>
                  <input
                    type="text"
                    name=""
                    id="search-coin"
                    placeholder="Search"
                    ref={searchRef}
                    defaultValue={query?.address}
                  />
                  <button type="submit" onClick={onAddToken}>
                    MANAGE
                  </button>
                </div>
              </div>
              {tokenName ? (
                <div className="token__manager">
                  <ul className="token__info">
                    <li>
                      <h5>Token Name</h5>
                      <h6>{tokenName[0]}</h6>
                    </li>
                    {!!tokenSymbol && (
                      <li>
                        <h5>Symbol</h5>
                        <h6>{tokenSymbol[0]}</h6>
                      </li>
                    )}
                    {!!tokenDecimals && (
                      <li>
                        <h5>Decimals</h5>
                        <h6>{tokenDecimals[0]}</h6>
                      </li>
                    )}
                    {!!tokenOwner && (
                      <li>
                        <h5>Owner</h5>
                        {typeof configSet.changeOwner === "undefined" && (
                          <h6 className="inp-group">
                            {tokenOwner[0]}{" "}
                            <button
                              className="btn-basic"
                              onClick={() => {
                                setConfigSet((c) => ({
                                  ...c,
                                  changeOwner: "",
                                }));
                              }}
                            >
                              Change
                            </button>
                          </h6>
                        )}
                        {typeof configSet.changeOwner !== "undefined" && (
                          <h6 className="inp-group">
                            <input
                              size={44}
                              type="text"
                              defaultValue={tokenOwner}
                              onChange={(e) => {
                                setConfigSet((c) => ({
                                  ...c,
                                  changeOwner: e.target.value,
                                }));
                              }}
                            />
                            <button
                              className="btn-error"
                              onClick={() => {
                                setConfigSet((c) => ({
                                  ...c,
                                  changeOwner: undefined,
                                }));
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-basic"
                              disabled={
                                transferOwnershipState.status === "Mining"
                              }
                              onClick={() => {
                                transferOwnershipFn(configSet.changeOwner);
                              }}
                            >
                              {transferOwnershipState.status === "Mining" && (
                                <div className="loading"></div>
                              )}
                              Update
                            </button>
                          </h6>
                        )}
                      </li>
                    )}
                    {!!tokenDecimals && !!tokenTotalSupply && (
                      <li>
                        <h5>Total Supply</h5>
                        <h6>
                          {formatUnits(tokenTotalSupply[0], tokenDecimals[0])}
                        </h6>
                      </li>
                    )}
                    {!!tokenDecimals && !!tokenTotalSupply && (
                      <li>
                        <h5>Your Balance</h5>
                        <h6>
                          {formatUnits(tokenBalance[0], tokenDecimals[0])}
                        </h6>
                      </li>
                    )}
                    {!!tokenTxFee && (
                      <li>
                        <h5>Transaction Fee</h5>
                        <h6>{tokenTxFee[0].toString()}%</h6>
                      </li>
                    )}
                    {!!tokenLiquidityFee && (
                      <li>
                        <h5>Liquidity Fee</h5>
                        <h6>{tokenLiquidityFee[0].toString()}%</h6>
                      </li>
                    )}
                    <li>
                      <h5>Burn</h5>
                      <h6 className="inp-group">
                        <input
                          size={16}
                          type="number"
                          onChange={(e) => {
                            setConfigSet((c) => ({
                              ...c,
                              burn: e.target.value,
                            }));
                          }}
                          placeholder="Amount"
                        />
                        <button
                          className="btn-basic"
                          disabled={burnState.status === "Mining"}
                          onClick={() => {
                            burnFn(parseUnits(configSet.burn, tokenDecimals), {
                              from: account,
                            });
                          }}
                        >
                          {burnState.status === "Mining" && (
                            <div className="loading"></div>
                          )}{" "}
                          Burn
                        </button>
                      </h6>
                    </li>
                    <li>
                      <h5>Mint</h5>
                      <h6 className="inp-group">
                        <input
                          size={16}
                          type="number"
                          onChange={(e) => {
                            setConfigSet((c) => ({
                              ...c,
                              mint: {
                                ...c.mint,
                                amount: e.target.value,
                              },
                            }));
                          }}
                          placeholder="Amount"
                        />
                        <input
                          size={44}
                          type="text"
                          onChange={(e) => {
                            setConfigSet((c) => ({
                              ...c,
                              mint: {
                                ...c.mint,
                                recipient: e.target.value,
                              },
                            }));
                          }}
                          placeholder="Recipient"
                        />
                        <button
                          className="btn-basic"
                          disabled={mintState.status === "Mining"}
                          onClick={() => {
                            mintFn(
                              configSet.mint?.recipient,
                              parseUnits(configSet.mint.amount, tokenDecimals),
                              { from: account }
                            );
                          }}
                        >
                          {mintState.status === "Mining" && (
                            <div className="loading"></div>
                          )}{" "}
                          Mint
                        </button>
                      </h6>
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          <Widgets />
        </div>
      </main>
    </div>
  );
};

export default ManageTokenIndex;
