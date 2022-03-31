import {
  getChainName,
  shortenAddress,
  useContractCalls,
  useContractFunction,
  useEthers,
} from "@usedapp/core";
import { utils } from "ethers";
import { Contract } from "ethers";
import { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import { SecondaryNavbar } from "../../components/navbar/navbarsecondary";
import { BuilderSidebar } from "../../components/sidebar/buildersidebar";
import { Widgets } from "../../components/widgets/widgets";
import CointoolNFTJson from "../../abis/CointoolNFT.json";
import { formatEther } from "ethers/lib/utils";
import { resolveIPFS, toDateTimeString } from "../../utils/StringUtils";
import { useToasts } from "react-toast-notifications";
import useSingleData from "../../hooks/useSingleData";
import { NATIVE_CURRENCY } from "../../constants/networks";
import { getSignificant, getSupportedChainId } from "../../utils/NumberUtils";
import usePrice from "../../hooks/usePrice";

const { Interface } = utils;

interface Props {
  address: string;
  chainIdProp: number;
}

const NFTPage: NextPage<Props> = ({ address, chainIdProp }) => {
  const { account, chainId, library } = useEthers();

  const contract = useMemo(
    () => ({
      abi: new Interface(CointoolNFTJson.abi),
      address: address,
    }),
    [address]
  );

  const signer: any = useMemo(() => {
    if (!library) return null;
    return library.getSigner(account).connectUnchecked();
  }, [library, account]);

  const signedContract: any = useMemo(
    () => new Contract(contract.address, contract.abi, signer),
    [account, contract.abi, contract.address, library]
  );

  const [activeTab, setActiveTab] = useState<"Mint" | "List">("Mint");

  const { addToast, removeToast } = useToasts();

  const [
    nftName,
    nftSymbol,
    nftPublic,
    nftMintPrice,
    nftStartTime,
    nftEndTime,
    nftTotalSupply,
    nftTokenURI0,
  ] = useSingleData(
    useContractCalls([
      {
        ...contract,
        method: "name",
        args: [],
      },
      {
        ...contract,
        method: "symbol",
        args: [],
      },
      {
        ...contract,
        method: "publicMint",
        args: [],
      },
      {
        ...contract,
        method: "mintPrice",
        args: [],
      },
      {
        ...contract,
        method: "startTime",
        args: [],
      },
      {
        ...contract,
        method: "endTime",
        args: [],
      },
      {
        ...contract,
        method: "totalSupply",
        args: [],
      },
      {
        ...contract,
        method: "tokenURI",
        args: [0],
      },
    ])
  );

  const [nftMetadata, setNftMetadata] = useState<{
    name: string;
    description: string;
    image: string;
  } | null>(null);

  useEffect(() => {
    if (nftTokenURI0) {
      const tokenURI = nftTokenURI0 + "";
      fetch(
        tokenURI.startsWith("ipfs://")
          ? "https://ipfs.io/ipfs/" + tokenURI.substring(7)
          : tokenURI
      )
        .then((res) => res.json())
        .then((data) => {
          setNftMetadata(data);
        })
        .catch((err) => {
          console.log("ERROR: ", err);
        });
    }
  }, [nftTokenURI0]);

  const nftCover = useMemo(() => {
    if (!nftMetadata) return null;
    return resolveIPFS(nftMetadata.image);
  }, [nftMetadata]);

  const nftList = useMemo(() => {
    if (!nftTotalSupply) return [];
    const total = +nftTotalSupply;
    const nfts = new Array<number>(total);
    for (let i = 0; i < nfts.length; i++) {
      nfts[i] = i + 1;
    }
    return nfts;
  }, [nftTotalSupply]);

  const nftOwners = useSingleData(
    useContractCalls(
      nftList.map((nft) => ({
        ...contract,
        method: "ownerOf",
        args: [nft],
      }))
    )
  );

  const { send: mintNFTFn, state: mintState } = useContractFunction(
    signedContract,
    "mint",
    { transactionName: "mintNFT" }
  );

  useEffect(() => {
    if (mintState.status === "Success") {
      removeToast("nftMinting");
      addToast("NFT Minted Successfully.", { appearance: "success" });
    } else if (mintState.status === "Mining") {
      addToast("NFT minting.", {
        appearance: "info",
        autoDismiss: false,
        id: "nftMinting",
      });
    } else if (
      mintState.status === "Exception" ||
      mintState.status === "Fail"
    ) {
      removeToast("nftMinting");
      addToast("Failed to mint. Reason: " + mintState.errorMessage, {
        appearance: "error",
      });
    }
  }, [mintState]);

  const { ethereum: ethPrices } = usePrice();

  return (
    <div id="wrapper">
      <SecondaryNavbar />

      <main id="main">
        <div className="container container-builder">
          <BuilderSidebar />

          <section className="minter">
            <div className="minter__left mw--100">
              <h1>
                NFT <span>Asset</span>
              </h1>
              <div className="nft-cover">
                {!!nftCover && (
                  <img src={nftCover} alt="*" width="100%" height="100%" />
                )}
              </div>
              <div className="nft-info">
                <div className="nft-tab-list">
                  <div
                    onClick={() => {
                      setActiveTab("Mint");
                    }}
                    className={activeTab === "Mint" ? "active" : ""}
                  >
                    Mint
                  </div>
                  <div
                    onClick={() => {
                      setActiveTab("List");
                    }}
                    className={activeTab === "List" ? "active" : ""}
                  >
                    List
                  </div>
                </div>
                {activeTab === "Mint" && (
                  <div className="nft-data">
                    <div className="left">
                      <h5>NFT DETAILS</h5>
                      <ul>
                        <li>
                          Contract Address:{" "}
                          <span>{shortenAddress(address)}</span>
                        </li>
                        <li>
                          Blockchain: <span>{getChainName(chainIdProp)}</span>
                        </li>
                        {!!nftName && (
                          <li>
                            Name: <span>{nftName}</span>
                          </li>
                        )}
                        {!!nftSymbol && (
                          <li>
                            Symbol: <span>{nftSymbol}</span>
                          </li>
                        )}
                        {!!nftStartTime && (
                          <li>
                            Start Time:{" "}
                            <span>{toDateTimeString(nftStartTime * 1000)}</span>
                          </li>
                        )}
                        {!!nftEndTime && (
                          <li>
                            Start Time:{" "}
                            <span>{toDateTimeString(nftEndTime * 1000)}</span>
                          </li>
                        )}
                        {!!nftTotalSupply && (
                          <li>
                            Already Minted:{" "}
                            <span>{nftTotalSupply.toString()}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="right">
                      {!!nftMintPrice && (
                        <div className="nft-price">
                          <span>Mint Price</span>
                          <strong>
                            {formatEther(nftMintPrice)}{" "}
                            {
                              NATIVE_CURRENCY[getSupportedChainId(chainId)]
                                .ticker
                            }
                          </strong>
                          <small>
                            $
                            {getSignificant(
                              ethPrices.usd * +formatEther(nftMintPrice),
                              2
                            )}
                          </small>
                        </div>
                      )}
                      {!!nftPublic && (
                        <div>
                          MINT STATUS:{" "}
                          {nftPublic ? "PUBLIC" : "PRIVATE (ADMIN ONLY)"}
                        </div>
                      )}
                      {!!account &&
                        !!nftPublic &&
                        !!nftStartTime &&
                        !!nftEndTime &&
                        !!nftMintPrice &&
                        Date.now() / 1000 > nftStartTime &&
                        Date.now() / 1000 < nftEndTime && (
                          <div className="nft-mint-btn">
                            <button
                              onClick={() => {
                                mintNFTFn(account, { value: nftMintPrice });
                              }}
                            >
                              Mint
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                )}
                {activeTab === "List" && <div className="nft-list"></div>}
              </div>
            </div>
          </section>

          <Widgets />
        </div>
      </main>
    </div>
  );
};

NFTPage.getInitialProps = ({ query }) => {
  const addressAndChain = (query.address + "").split("-");
  const chainId = +addressAndChain.pop();
  return {
    address: addressAndChain.pop(),
    chainIdProp: chainId,
  };
};

export default NFTPage;
