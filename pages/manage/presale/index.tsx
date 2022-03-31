import { isAddress } from "@ethersproject/address";
import {
  ERC20Interface,
  useContractCalls,
  useContractFunction,
  useEthers,
} from "@usedapp/core";
import { formatUnits, Interface } from "ethers/lib/utils";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { SecondaryNavbar } from "../../../components/navbar/navbarsecondary";
import { BuilderSidebar } from "../../../components/sidebar/buildersidebar";
import { Widgets } from "../../../components/widgets/widgets";
import { IPresaleManageConfig } from "../../../interfaces/IPresaleManageConfig";
import presaleJSON from "../../../artifacts/contracts/PresaleToken.sol/PresaleToken.json";
import { Contract } from "ethers";
import { PresaleConfig } from "../../../interfaces/solidity/PresaleConfig";
import { formatHtmlDateTime } from "../../../utils/StringUtils";

const PresaleManager: NextPage = () => {
  const { account, library } = useEthers();
  const { query, replace } = useRouter();
  const [searchToken, setSearchToken] = useState("");
  const [configSet, setConfigSet] = useState<IPresaleManageConfig>({});
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { addToast } = useToasts();

  useEffect(() => {
    if (query?.address) {
      if (typeof query.address === "string" && query.address.includes("-")) {
        const address = query.address.split("-");
        setSearchToken(address[0]);
      }
    }
  }, [query?.address]);

  const onAddToken = () => {
    const tokenAddress = searchRef.current.value;
    if (isAddress(tokenAddress)) {
      setSearchToken(tokenAddress);
      replace(`/manage/presale?address=${tokenAddress}`);
    } else {
      alert("Invalid Address");
    }
  };

  const contractData = useMemo(
    () => ({
      abi: new Interface(presaleJSON.abi),
      address: searchToken,
    }),
    [searchToken]
  );

  const signedContract: any = useMemo(
    () =>
      !account || !library || searchToken === ""
        ? null
        : new Contract(
            searchToken,
            contractData.abi,
            library.getSigner(account).connectUnchecked() as any
          ),
    [account, library, contractData.abi, searchToken]
  );

  // useEffect(() => {
  //   window.contract = signedContract;
  // }, [signedContract]);

  const [owner, presaleRate, deadline, tokenAddress, config] = useContractCalls(
    [
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
        method: "getDeadline",
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
    ]
  );

  const mappedConfig = useMemo(() => {
    if (!config) return null;
    return PresaleConfig.mapFromArray(config[0]);
  }, [config]);

  const tokenContractData = useMemo(
    () =>
      tokenAddress
        ? {
            abi: ERC20Interface,
            address: tokenAddress[0],
          }
        : null,
    [tokenAddress]
  );

  const [tokenName, tokenSymbol, tokenDecimals] = useContractCalls([
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
  ]);

  const { state: transferOwnershipState, send: transferOwnershipFn } =
    useContractFunction(signedContract, "transferOwnership");

  return (
    <div id="wrapper">
      <SecondaryNavbar />

      <main id="main">
        <div className="container container-builder">
          <BuilderSidebar />

          <section className="minter">
            <div className="minter__left mw--100">
              <h1>
                Presale <span>Manager</span>
              </h1>
              <div className="token__search">
                <label htmlFor="search-coin">Address IDO:</label>
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
              <div className="token__manager">
                <ul className="token__info">
                  {!!owner && (
                    <li>
                      <h5>Owner</h5>
                      {typeof configSet.changeOwner === "undefined" && (
                        <h6 className="inp-group">
                          {owner[0]}{" "}
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
                            defaultValue={owner}
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
                  {!!tokenName && !!tokenSymbol && (
                    <li>
                      <h5>Token</h5>
                      <h6 className="inp-group">
                        {tokenName[0]} ({tokenSymbol[0]})
                      </h6>
                    </li>
                  )}
                  {!!presaleRate && !!tokenDecimals && (
                    <li>
                      <h5>Presale Rate</h5>
                      <h6 className="inp-group">
                        <input
                          size={44}
                          type="text"
                          defaultValue={formatUnits(
                            presaleRate[0],
                            tokenDecimals[0]
                          )}
                          onChange={(e) => {
                            setConfigSet((c) => ({
                              ...c,
                              presaleRate: e.target.value,
                            }));
                          }}
                        />
                      </h6>
                    </li>
                  )}
                  {!!mappedConfig && (
                    <li>
                      <h5>Start Time</h5>
                      <h6 className="inp-group">
                        <input
                          size={44}
                          type="datetime-local"
                          defaultValue={formatHtmlDateTime(
                            new Date(+mappedConfig.startTime.toString() * 1000)
                          )}
                          onChange={(e) => {
                            setConfigSet((c) => ({
                              ...c,
                              startTime: +new Date(e.target.value),
                            }));
                          }}
                        />
                      </h6>
                    </li>
                  )}
                  {!!deadline && (
                    <li>
                      <h5>Deadline</h5>
                      <h6 className="inp-group">
                        <input
                          size={44}
                          type="datetime-local"
                          defaultValue={formatHtmlDateTime(
                            new Date(+deadline[0] * 1000)
                          )}
                          readOnly={true}
                        />
                      </h6>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <Widgets />
        </div>
      </main>
    </div>
  );
};

export default PresaleManager;
