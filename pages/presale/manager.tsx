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
import { utils, Contract, ContractFactory } from "ethers";
import { formatUnits, parseEther } from "@ethersproject/units";
import CustomERC20 from "../../abis/CustomERC20.json";
import { useToasts } from "react-toast-notifications";
import { ITokenPresaleProps } from "../../interfaces/ITokenPresaleProps";
import { SecondaryNavbar } from "../../components/navbar/navbarsecondary";
import { BuilderSidebar } from "../../components/sidebar/buildersidebar";
import { Widgets } from "../../components/widgets/widgets";
import { NATIVE_CURRENCY } from "../../constants/networks";
import { getSupportedChainId } from "../../utils/NumberUtils";
import { formatHtmlDateTime } from "../../utils/StringUtils";
import { PresaleConfig } from "../../interfaces/solidity/PresaleConfig";
import { PRESALE_DEPLOY_CHARGE } from "../../constants/system";
import Modal from "../../components/modal/Modal";
import Link from "next/link";
import CopyToClipboard from "../../components/copy-to-clipboard/CopyToClipboard";
import { Navbar } from "../../components/navbar/navbar";
import { Footer } from "../../components/footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const { Interface, parseUnits } = utils;

const ManageTokenIndex: NextPage = () => {
  const { account, library, chainId } = useEthers();
  const [searchToken, setSearchToken] = useState("");
  const [phase, setPhase] = useState<"Selection" | "Configure">("Selection");
  const [tokenManager, setTokenManager] = useState(false);
  const [configSet, setConfigSet] = useState<ITokenPresaleProps>({
    presaleRate: 3000,
    softCap: 50,
    hardCap: 100,
    minContributionLimit: 0,
    maxContributionLimit: 0,
    startTime: new Date(),
    owner: account,
    presaleDays: 3,
    whitelistOnly: false,
  });
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [openHour, setOpenHour] = useState(false);
  const handleChange = (e) => {
    setIsOpen(!isOpen);
    setStartDate(e);
  };
  const handleClick = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (account) {
      setConfigSet((c) => ({
        ...c,
        owner: account,
      }));
    }
  }, [account]);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const { addToast, removeAllToasts } = useToasts();

  const [deployedContract, setDeployedContract] = useState<{
    address: string;
  } | null>(null);

  const onAddToken = () => {
    const tokenAddress = searchRef.current.value;
    if (isAddress(tokenAddress)) {
      setSearchToken(tokenAddress);
    } else {
      addToast("Invalid Address", { appearance: "error" });
    }
  };

  const customTokenInterface = useMemo(
    () => new Interface(CustomERC20.abi),
    []
  );

  const customTokenContract = useMemo(() => {
    if (isAddress(searchToken))
      return new Contract(
        searchToken,
        customTokenInterface,
        library?.getSigner?.()
      );
    return undefined;
  }, [searchToken, customTokenInterface, library]);

  const [
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenTotalSupply,
    tokenBalance,
    tokenOwner,
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
  ]);

  const presaleUntil = useMemo(() => {
    const date = new Date(configSet.startTime);
    date.setDate(date.getDate() + configSet.presaleDays);
    return date;
  }, [configSet.startTime, configSet.presaleDays]);

  const onDeploy = useCallback(async () => {
    addToast("Preparing smart contract.", {
      appearance: "info",
      autoDismiss: false,
    });
    const response = await fetch(`/api/presale/code`, {
      method: "POST",
      body: JSON.stringify({
        chainId,
        ...configSet,
        presaleRate: parseUnits(
          configSet.presaleRate.toString(),
          tokenDecimals
        ),
      }),
    });
    const code = (await response.json()) as ContractFile;
    const abi = code.abi;
    const bytecode = code.evm.bytecode.object;
    removeAllToasts();
    addToast("Deploying contract.", {
      appearance: "info",
      autoDismiss: false,
    });
    const factory = new ContractFactory(abi, bytecode, library?.getSigner?.());

    const deployed = await factory.deploy(
      searchToken,
      configSet.owner,
      parseUnits(configSet.presaleRate.toString(), tokenDecimals),
      {
        hardCap: parseEther(configSet.hardCap.toString()),
        softCap: parseEther(configSet.softCap.toString()),
        lockDays: 0,
        startTime: Math.floor(Date.now() / 1000).toString(),
        maxContribution: parseUnits(
          configSet.maxContributionLimit.toString(),
          tokenDecimals?.[0] ?? 18
        ),
        minContribution: parseUnits(
          configSet.minContributionLimit.toString(),
          tokenDecimals?.[0] ?? 18
        ),
        presaleDays: configSet.presaleDays,
        whitelistOnly: false,
      } as PresaleConfig,
      { value: parseEther(PRESALE_DEPLOY_CHARGE[chainId]) }
    );
    setDeployedContract({ address: deployed.address });
    removeAllToasts();
  }, [configSet, chainId, searchToken]);

  return (
    <div id="wrapper" className="presale-wrapper">
      <Navbar buttonClass="presale-button"/>
      <img src="/images/bg-3.png" className="auditing-bg-image"/>
      <main id="main">
        <div className="container container-builder">
          <BuilderSidebar />

<div className='auditingCenterSection'>
<h1 style={{textAlign:"center"}} className="token-presale"><span> Presale</span> Manager</h1>
        <p className='presale-headline'>
          headline goes here
        </p>
        <div className='input-container'>
        <img src="/images/Ellipse-59.png" style={{position:"absolute", top: -100, left:-100}}/>
        <img src="/images/Ellipse-58.png" style={{position:"absolute", top: -63, left:-60}}/>
          <i className=' icon presale-search'>
            <img src='/images/searchicon.png' alt='' />
          </i>
          <div className='input-divider-left' />
          <input
            className='input-field'
            type='text'
            placeholder='Bitcoin'
            name='Bitcoin'
            value="0x2385790235dfgdh70x2385790235dfgdh7"
          />
          <div className='input-divider-right' />
          <span className='input-searchtext-right'>MANAGE</span>
        </div>
        <div className='auditingmain mint-manager-scroll' style={{padding:"0 25px"}}>
        <div className='audit-coin-address-section border-left-before bg-big-card'>
              <span className='audit-coin-address'>Owner:</span>
              <span className='audit-coin-address-value'>
              0x2385790235dfgdh70x2385790235dfgdh7
              </span>
              <div className='input-divider-right' />
          <span className='input-searchtext-right'>UPDATE</span>
            </div>
          <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <div className='audit-tokenname-section'>
              <span className='audit-tokenname'>Bitcoin</span>

              <img className='audit-Ellipse3' src='/images/Ellipse-3.png' />
              <span className='audit-coin-name'>BITCOIN</span>
              
            </div>
            <div className='audit-tokenname-section '>
              {' '}
              <span className='audit-coin-name-abbrevation'>
              Presale rate
              </span>
              <span className='audit-coin-name-abbrevation-value'>3000.0</span>
              <div className='input-divider-right' style={{right:"20%"}} />
          <span className='input-searchtext-right'>BURN</span>
            </div>

          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-evenly',alignItems:"center" }}>
            <div className='audit-tokenname-section' style={{display:"flex",alignItems:"center"}}>
              <span className='audit-tokenname'>Deadline</span>
              <span className='audit-coin-name-abbrevation-value' style={{width:"auto"}}>01/18/2022 12:44PM</span>
              <span style={{position:"absolute",right:25}}><img src="/images/calendar.png" /><img src="/images/clock.png" style={{margin:"0 20px"}} onClick={() => setOpenHour(!openHour)}/></span>
            </div>

                        <div className='audit-tokenname-section' style={{display:"flex",alignItems:"center"}}>
              <span className='audit-tokenname'>Deadline</span>
              <span className='audit-coin-name-abbrevation-value' style={{width:"auto"}}>01/18/2022 12:44PM</span>
              <span style={{position:"absolute",right:25}}><img src="/images/calendar.png" onClick={handleClick}/><img src="/images/clock.png" style={{margin:"0 20px"}} /></span>
              {isOpen && (
        <DatePicker selected={startDate} onChange={handleChange} inline />
      )}
      {openHour && <div className="time-picker">
                <div className="starting-time"><span className="basic-span"> - </span> <span className="main-span"> 02 </span> <span> + </span> </div>
                <div className="starting-time" style={{marginTop:20}}><span className="basic-span"> - </span> <span className="main-span"> 46 </span> <span> + </span> </div>
                <div className="choosing-am-pm" style={{marginTop:20}}><span>AM</span> <span className="active">PM</span></div>
          </div>}
            </div>
            </div>
        </div>
      </div> 
            
        <div>
          <Widgets />
          <button className="token-manager" onClick={() => setTokenManager(!tokenManager)}>{!tokenManager ? "Presale manager": "Token Minting"}</button>
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
          Please send {configSet.hardCap} {tokenName} ({tokenSymbol}) to this
          contract to start presale.
          <br />
          Click{" "}
          <Link
            href={
              "/manage/presale?address=" +
              deployedContract?.address +
              "-" +
              chainId
            }
            passHref
          >
            <a>here</a>
          </Link>{" "}
          to manage.
          <br />
          Your IDO panel:{" "}
          <Link
            href={"/presale/" + deployedContract?.address + "-" + chainId}
            passHref
          >
            <a>
              /presale/{deployedContract?.address}-{chainId}
            </a>
          </Link>{" "}
          <CopyToClipboard data={"/presale/" + deployedContract?.address}>
            ▣
          </CopyToClipboard>
        </div>
      </Modal>
      <Footer />
    </div>
  );
};

export default ManageTokenIndex;
