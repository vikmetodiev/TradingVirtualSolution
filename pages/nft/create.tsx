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
    <div id="wrapper" className="nft-create-wrapper">
      <Navbar buttonClass="nft-create-button" />
      <img src="/images/bg-3.png" className="auditing-bg-image"/>
      <main id="main">
        <div className="container container-builder">
          <BuilderSidebar />

          <div className='auditingCenterSection'>
 <h1 style={{textAlign:"center"}} className="nft-create-header">NFT<span> Create</span></h1>
          <p className='token-headline' style={{color:"#B35EC8"}}>
            headline goes here
          </p>
          <div className='input-container'>
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
              <div className='audit-tokenname-section'>
                <span className='audit-tokenname'>Name</span>

                <span className='audit-coin-name-abbrevation-value'>Dasd</span>
              </div>
              <div className='audit-tokenname-section'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                Symbol
                </span>
                <span className='audit-coin-name-abbrevation-value'>Enter Symbol</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <div className='audit-tokenname-section' style={{textAlign:"center"}}>
                <span className='audit-tokenname'>Image</span>

                <span className='audit-coin-name-abbrevation-value'>+</span>
              </div>
              <div className='audit-tokenname-section'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                Use Image Url
                </span>
                <span className='audit-coin-name-abbrevation-value'>http://</span>
              </div>
            </div>
            <div className='audit-coin-address-section border-left-before bg-big-card'>
              <span className='audit-coin-address'>Description</span>
              <span className='audit-coin-address-value'>
                Enter description
              </span>
            </div>
            

            <div style={{display:"flex"}}>
            <div className="token__toggle public-mint" style={{marginTop: "27px",
    marginLeft:" 38px",
    marginRight: "17px"}}>
                  <p>Public Mint</p>
  
                  <div className="toggle">
                    <input type="checkbox" name="" id="toggle" />
                    <label htmlFor="toggle">
                      <span className="toggle-inner"></span>
                      <span className="toggle-button"></span>
                    </label>
                  </div>
                </div>
                <div className='audit-coin-address-section border-left-before bg-big-card' style={{width:"100%"}}>
              <span className='audit-coin-address'>Description</span>
              <span className='audit-coin-address-value'>
                Enter description
              </span>
            </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly',alignItems:"center" }}>
            <div className='audit-tokenname-section' style={{display:"flex",alignItems:"center"}}>
              <span className='audit-tokenname'>Deadline</span>
              <span className='audit-coin-name-abbrevation-value' style={{width:"auto"}}>01/18/2022 12:44PM</span>
              <span style={{position:"absolute",right:25}}><img src="/images/calendar.png" /><img src="/images/clock.png" style={{margin:"0 20px"}}/></span>
            </div>
            <div className='audit-tokenname-section' style={{display:"flex",alignItems:"center"}}>
              <span className='audit-tokenname'>Deadline</span>
              <span className='audit-coin-name-abbrevation-value' style={{width:"auto"}}>01/18/2022 12:44PM</span>
              <span style={{position:"absolute",right:25}}><img src="/images/calendar.png" /><img src="/images/clock.png" style={{margin:"0 20px"}}/></span>
            </div>
            </div>
            <div className='audit-coin-address-section border-left-before bg-big-card'>
              <span className='audit-coin-address'>Contact Address:</span>
              <span className='audit-coin-address-value'>
                0x001b23c12ax13k123ab32cb...
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <div className='audit-tokenname-section'>
                <span className='audit-tokenname'>User max mint (0 for no limit)</span>

                <span className='audit-coin-name-abbrevation-value'>0</span>
              </div>
              <div className='audit-tokenname-section'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                Total supply (0 for no limit)
                </span>
                <span className='audit-coin-name-abbrevation-value'>0</span>
              </div>
            </div>

<div style={{display:"flex",justifyContent:"center",marginBottom:25}}>
            <button className="token-manager" style={{maxWidth:250}}>Deploy Contract</button>
            </div>
          </div>
        </div>
        <div>
          <Widgets />
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
            ???
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
