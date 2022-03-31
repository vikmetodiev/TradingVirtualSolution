import { isAddress } from "@ethersproject/address";
import { NextPage } from "next";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ERC20Interface,
  useContractCalls,
  useEthers,
  useContractFunction,
} from "@usedapp/core";
import { parseEther } from "@ethersproject/units";
import { ContractFactory } from "ethers";
import { useToasts } from "react-toast-notifications";
import { SecondaryNavbar } from "../../components/navbar/navbarsecondary";
import { BuilderSidebar } from "../../components/sidebar/buildersidebar";
import { Widgets } from "../../components/widgets/widgets";
import { getSignificant, getSupportedChainId } from "../../utils/NumberUtils";
import { formatHtmlDateTime, toFormData } from "../../utils/StringUtils";
import { NFT_DEPLOY_CHARGE } from "../../constants/system";
import Modal from "../../components/modal/Modal";
import Link from "next/link";
import CopyToClipboard from "../../components/copy-to-clipboard/CopyToClipboard";
import { INFTProps } from "../../interfaces/INFTProps";
import ImageUploader from "../../components/image-uploader/ImageUploader";
import { NATIVE_CURRENCY } from "../../constants/networks";
import usePrice from "../../hooks/usePrice";
import { Navbar } from "../../components/navbar/navbar";
// import pinata from "../../constants/pinata";

interface Props {
  clientID: string;
}

const ManageTokenIndex: NextPage<Props> = ({ clientID }) => {
  const { account, library, chainId } = useEthers();

  const signer: any = useMemo(() => {
    if (!library) return null;
    return library.getSigner(account);
  }, [library, account]);

  const [searchToken, setSearchToken] = useState("");
  const [phase, setPhase] = useState<"Selection" | "Configure">("Selection");
  const [tokenManager, setTokenManager] = useState(false);
  const [configSet, setConfigSet] = useState<INFTProps>({
    name: "",
    symbol: "",
    coverImage: "",
    mintPrice: "0",
    totalSupply: "0",
    userMaxMint: "0",
    owner: "",
    endTime: Date.now() + 3 * 60 * 60 * 24 * 1000,
    startTime: Date.now(),
    publicMint: true,
    description: "",
    chainId: getSupportedChainId(chainId),
  });

  useEffect(() => {
    if (account) {
      setConfigSet((c) => ({
        ...c,
        owner: account,
      }));
    }
  }, [account]);

  const [deployedContract, setDeployedContract] = useState<{
    address: string;
  } | null>(null);

  const onDeploy = useCallback(async () => {
    const updatedConfig = {
      ...configSet,
    };
    console.log(updatedConfig);

    if (typeof updatedConfig.coverImage !== "string") {
      try {
        console.log("Well");

        const formData = new FormData();
        formData.append("file", updatedConfig.coverImage);
        const pinataRes = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            headers: {
              Authorization: `Bearer ${clientID}`,
            },
            body: formData,
            method: "POST",
          }
        );
        const data = await pinataRes.json();
        updatedConfig.coverImage = `ipfs://${data.IpfsHash}`;
        console.log(updatedConfig);
      } catch (error) {
        console.log("ERROR: ", error);
      }
    }
    const response = await fetch(`/api/nft/code`, {
      method: "POST",
      body: JSON.stringify({
        ...updatedConfig,
        chainId,
      }),
    });
    const code = (await response.json()) as ContractFile;
    const abi = code.abi;
    const bytecode = code.evm.bytecode.object;
    const factory = new ContractFactory(abi, bytecode, signer);

    const deployed = await factory.deploy({
      value: parseEther(NFT_DEPLOY_CHARGE[chainId]),
    });
    setDeployedContract({ address: deployed.address });
  }, [configSet, chainId, searchToken]);

  const { ethereum: ethPrices } = usePrice();

  return (
    <div id="wrapper">
      <Navbar />

      <main id="main">
        <div className="container container-builder">
          <BuilderSidebar />

          <div className='auditingCenterSection'>
 <h1 style={{textAlign:"center"}} className="token-minting"><span>Token</span> Manager</h1>
          <p className='token-headline'>
            headline goes here
          </p>
          <div className='input-container'>
          <img src="/images/Ellipse-55.png" style={{position:"absolute", top: -94, left:-90}}/>
          <img src="/images/Ellipse-54.png" style={{position:"absolute", top: -63, left:-60}}/>
            <i className=' icon search'>
              <img src='/images/searchicon.png' alt='' />
            </i>
            <div className='input-divider-left' />
            <input
              className='input-field'
              type='text'
              placeholder='Bitcoin'
              name='Bitcoin'
            />
            <div className='input-divider-right' />
            <span className='input-searchtext-right'>SEARCH</span>
          </div>
          <div className='auditingmain mint-manager-scroll' style={{padding:"0 25px"}}>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <div className='audit-tokenname-section token-minting-bg-card'>
                <span className='audit-tokenname'>Token Name</span>

                <img className='audit-Ellipse3' src='/images/Ellipse-3.png' />
                <span className='audit-coin-name'>BITCOIN</span>
              </div>
              <div className='audit-tokenname-section token-minting-bg-card'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                Token Abbreviation (BTC)
                </span>
                <span className='audit-coin-name-abbrevation-value'>BTC</span>
              </div>
              <div className='audit-tokenname-section token-minting-bg-card'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                Decimals
                </span>
                <span className='audit-coin-name-abbrevation-value'>18</span>
              </div>
            </div>
            <div className='audit-coin-address-section border-left-before bg-big-card'>
              <span className='audit-coin-address'>Contact Address:</span>
              <span className='audit-coin-address-value'>
                0x001b23c12ax13k123ab32cb...
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <div className='audit-tokenname-section token-minting-bg-card'>
                <span className='audit-tokenname'>Total Supply</span>
                <span className='audit-coin-name-abbrevation-value'>1000000.00</span>
              </div>
              <div className='audit-tokenname-section token-minting-bg-card'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                Your Balance
                </span>
                <span className='audit-coin-name-abbrevation-value'>1000000.00</span>
              </div>
              <div className='audit-tokenname-section token-minting-bg-card'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                Decimals
                </span>
                <span className='audit-coin-name-abbrevation-value'>18</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <div className='audit-tokenname-section bg-card' style={{width:375}}>
                <span className='audit-tokenname'>Fee</span>

                <img className='audit-Ellipse3' src='/images/Ellipse-3.png' />
                <span className='audit-coin-name'>1000000.00</span>
              </div>
              <div className='audit-tokenname-section ' style={{width:375}}>
                <span className='audit-coin-name-abbrevation'>
                Burn
                </span>
                <span className='audit-coin-name-abbrevation-value'>100</span>
                <div className='input-divider-right' style={{right:"20%"}} />
            <span className='input-searchtext-right'>Burn</span>
              </div>
            </div>
            <div className='audit-coin-address-section border-left-before bg-big-card'>
              <span className='audit-coin-address'><span>Mint Amount</span> <span style={{marginLeft:"190px"}}>Mint recipient</span></span>
              <span className='audit-coin-address-value'>
                <span>100</span>
                <span style={{marginLeft:"230px"}}>@JohnDoe</span>
              </span>
              <div className='input-divider-right' style={{right:"15%"}} />
            <span className='input-searchtext-right'>Mint</span>
            </div>
          </div>
        </div>
        <div>
          <Widgets />
          <button className="token-manager" onClick={() => setTokenManager(!tokenManager)}>{!tokenManager ? "Token manager": "Token Minting"}</button>
          </div>
        </div>
      </main>
      <Modal
        open={!!deployedContract}
        onClose={() => {
          setDeployedContract(null);
        }}
        title="Contract Deployed"
      >
        <div className="modal__body">
          Your contract has been deployed to {deployedContract?.address}.<br />
          Your NFT panel:{" "}
          <Link
            href={"/nft/" + deployedContract?.address + "-" + chainId}
            passHref
          >
            <a>
              /nft/{deployedContract?.address}-{chainId}
            </a>
          </Link>{" "}
          <CopyToClipboard
            data={"/nft/" + deployedContract?.address + "-" + chainId}
          >
            ▣
          </CopyToClipboard>
        </div>
      </Modal>
    </div>
  );
};

ManageTokenIndex.getInitialProps = () => {
  return {
    clientID: process.env.PINATA_API_JWT,
  };
};

export default ManageTokenIndex;
