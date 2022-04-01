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
 <h1 style={{textAlign:"center"}} className="nft-create-header">NFT<span> Asset</span></h1>
          <p className='token-headline' style={{color:"#B35EC8"}}>
            headline goes here
          </p>
          <div
            style={{ position: 'relative' }}
            className='aboutCardsContainer '
          ><div
          style={{
            width: '367px',
            height:"367px",
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div className='aboutCards' style={{ zIndex: 9999, width:"367px",display:"block" }}>
          <span className='audit-tokenname'>NFT Details</span>
          <div className='audit-coin-name-abbrevation-value' style={{width:"auto"}}>
              <span>Contact Address:</span><span style={{marginLeft:13, color:"#B35EC8"}}>0x3756..8456789</span>
              </div><div className='audit-coin-name-abbrevation-value' style={{top:100,width:"auto"}}>
              <span>Blockchain:</span><span className="basic-span" style={{marginLeft:134}}>Rinkeby</span></div><div className='audit-coin-name-abbrevation-value' style={{top:140,width:"auto"}}>
              <span>Name:</span><span className="basic-span" style={{marginLeft:198}}>dsfsd</span></div><div className='audit-coin-name-abbrevation-value' style={{top:180,width:"auto"}}>
              <span>Symbol:</span><span className="basic-span" style={{marginLeft:208}}>dd</span></div><div className='audit-coin-name-abbrevation-value' style={{top:220,width:"auto"}}>
              <span>Start time:</span><span className="basic-span" style={{marginLeft:22}}>18-1-2022, 2:48:29 PM</span></div><div className='audit-coin-name-abbrevation-value' style={{top:260,width:"auto"}}>
              <span>End time:</span><span className="basic-span" style={{marginLeft:33}}>21-1-2022, 2:48:29 PM</span></div><div className='audit-coin-name-abbrevation-value' style={{top:300,width:"auto"}}>
              <span>Already minted:</span><span className="basic-span" style={{marginLeft:155}}>0</span></div>
          
          </div>
        </div>
        <div

                style={{
                  width: '367px',
                  height:" 367px",
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div className='aboutCards' style={{ zIndex: 9999, width:"367px" }}>
                <span className='audit-tokenname'>Mint price</span>
                <div className='audit-coin-name-abbrevation-value' style={{width:"auto"}}>
              <span style={{fontSize:40}}>0.0 rETH</span><span style={{marginLeft:13}}>(0 USD)</span>
              </div>
                </div>
                <div style={{position:"absolute", bottom:60,zIndex:10000}}><span style={{fontSize:15}}>Mint status:</span><span className="basic-span" style={{marginLeft:155}}>Public</span></div>
              </div>
              
              </div>

          <div style={{display:"flex",justifyContent:"center",marginBottom:25}}>
            <button className="token-manager" style={{maxWidth:250}}>Mint</button>
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
