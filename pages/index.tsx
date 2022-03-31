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
} from '@usedapp/core'
import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navbar } from '../components/navbar/navbar'
import { Sidebar } from '../components/sidebar/sidebar'
import { Widgets } from '../components/widgets/widgets'
import {
  ADDRESS_LIST_INPUT_FORMATS,
  MultiSenderInterface,
  MULTISENDER_ADDRESS,
  ZERO_ADDRESS,
} from '../constants/multisender'
import { AddressMap } from '../interfaces/IAddressMap'
import { mapAddresses } from '../utils/StringUtils'
import CodeMirror from '@uiw/react-codemirror'
import { formatUnits, parseEther, parseUnits } from '@ethersproject/units'
import { useGlobalContext } from '../hooks/useGlobalContext'
import { ApprovalOption } from '../interfaces/ApprovalOption'
import { Contract, Signer } from 'ethers'
import { getCharge, getSupportedChainId } from '../utils/NumberUtils'
import GasChooser from '../components/gas-chooser/GasChooser'
import { NATIVE_CURRENCY } from '../constants/networks'
import { BigNumber } from 'ethers'
import TransactionDetails from '../components/transaction-details/TransactionDetails'
import { IGasData } from '../interfaces/IGasData'
import { Footer } from '../components/footer'

const IndexPage: NextPage = () => {
  const uploaderRef = useRef<HTMLInputElement | null>(null)
  const addressInputRef = useRef<HTMLInputElement | null>(null)
  const { account, chainId, library } = useEthers()

  const signer: any = useMemo(() => {
    if (!library) return null
    return library.getUncheckedSigner(account)
  }, [library, account])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      let format = 'txt'
      if (file.name.endsWith('csv')) format = 'csv'
      file.text().then((data) => {
        setInputText(data.replace(/;/g, ','))
      })
    }
  }

  const [tokenAddress, setTokenAddress] = useState('')
  const [inputText, setInputText] = useState('')
  const [substate, setSubstate] = useState<'' | 'GAS'>('')

  const [addressMapping, setAddressMapping] = useState<AddressMap>({})

  const gasPrice = useGasPrice()

  const globalContext = useGlobalContext()

  useEffect(() => {
    setAddressMapping(mapAddresses(inputText, 'txt'))
  }, [inputText])

  const [token, setToken] = useState<Token | undefined>(undefined)
  const balance = useTokenBalance(token?.address, account)
  const nativeBalance = useEtherBalance(account)
  const contractData = useContractCalls([
    {
      abi: ERC20Interface,
      address: tokenAddress ?? '',
      method: 'name',
      args: [],
    },
    {
      abi: ERC20Interface,
      address: tokenAddress ?? '',
      method: 'symbol',
      args: [],
    },
    {
      abi: ERC20Interface,
      address: tokenAddress ?? '',
      method: 'decimals',
      args: [],
    },
  ])
  const allowance = useTokenAllowance(
    tokenAddress,
    account,
    MULTISENDER_ADDRESS[getSupportedChainId(chainId)]
  )

  const [lastGas, setLastGas] = useState<IGasData>({
    gasLimit: BigNumber.from(0),
    maxFeePerGas: BigNumber.from(0),
  })

  useEffect(() => {
    if (tokenAddress && contractData) {
      if (tokenAddress === ZERO_ADDRESS) {
        setToken({
          ...NATIVE_CURRENCY[getSupportedChainId(chainId)],
          format: (_) => '0',
          address: ZERO_ADDRESS,
        })
      } else {
        setToken({
          address: tokenAddress,
          chainId: getSupportedChainId(chainId),
          decimals: contractData?.[2]?.[0] ?? 18,
          name: contractData?.[0]?.[0] ?? 'Unknown Token',
          ticker: contractData?.[1]?.[0] ?? '--',
          format: (v) => v,
          formattingOptions: {
            decimals: contractData?.[2]?.[0] ?? 18,
            decimalSeparator: '.',
            fixedPrecisionDigits: 3,
            prefix: '',
            suffix: '',
            significantDigits: 4,
            thousandSeparator: ',',
            useFixedPrecision: false,
          },
        })
      }
    }
  }, [chainId, contractData, tokenAddress])

  const onContinue = () => {
    const addresses = Object.keys(addressMapping)
    if (addresses.length > 0) {
      globalContext.multisender.setPhase('CONFIRMATION')
    }
  }

  const totalAmount = useMemo(
    () =>
      Object.keys(addressMapping).reduce(
        (prev, curr) => prev + (curr ? +addressMapping[curr] : 0),
        0
      ),
    [addressMapping]
  )

  const tokenContract: any = useMemo(
    () =>
      new Contract(
        token?.address ?? '0x4Bc0fad64DE3b6b6c9F8b490CE8752801D0B8d49',
        ERC20Interface,
        signer
      ),
    [token?.address, library]
  )

  const mainContract: any = useMemo(
    () =>
      new Contract(
        MULTISENDER_ADDRESS[getSupportedChainId(chainId)],
        MultiSenderInterface,
        signer
      ),
    [chainId]
  )

  const { state: approveState, send: approveCallback } = useContractFunction(
    tokenContract,
    'approve'
  )

  const onApprove = useCallback(() => {
    approveCallback(
      MULTISENDER_ADDRESS[getSupportedChainId(chainId)],
      parseUnits(totalAmount.toString(), token?.decimals ?? 18),
      { from: account }
    )
  }, [approveCallback, totalAmount, token?.decimals, account, chainId])

  const [approvalOption, setApprovalOption] = useState<ApprovalOption>(
    ApprovalOption.Exact
  )

  const { send: multiSend, state: multisendState } = useContractFunction(
    mainContract,
    token?.address === ZERO_ADDRESS ? 'sendNative' : 'sendToken',
    {
      transactionName: 'multisend',
      signer,
    }
  )

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
    )
    globalContext.multisender.setPhase('MAILING')
  }

  return (
    <div id='wrapper' className='scrollclass'>
      <Head>
        <title>Virtual Trading Solutions</title>
        <meta name='description' content='Virtual Trading Solutions website.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Navbar />

      <main id='main '>
        <div className='container'>
          <Sidebar />

          <section className='token'>
            <h1 className='main_heading'>Virtual Trading Solutions</h1>
            <h1 className='sub_heading'>
              The <span>foundation</span> to support your <span>creation</span>
            </h1>
            <p className='home_sub_heading'>
              The tools you need to launch your creation, all in one place.
            </p>
            <div className='tools_main_div'>
              <div className='tools_row tools_row_border_bottom'>
                <div className='tool_div tool_div_border_rigth token_minting'>
                  <span className='icon_box' style={{marginLeft:-50}}>
                    <svg>
                      <use xlinkHref='/icons/sprite.svg#icon-token-minting'></use>
                    </svg>
                  </span>
                  <p className='tool_div_text'>TOKEN MINTING </p>
                </div>
                <div className='tool_div tool_div_border_rigth bulk_sending'>
                  <span className='icon_box'>
                    <svg >
                      <use xlinkHref='/icons/sprite.svg#icon-token-bulk-sending'></use>
                    </svg>
                  </span>
                  <p className='tool_div_text'>Token bulk Sending</p>
                </div>
                <div className='tool_div'>
                  <span className='icon_box'>
                    <svg>
                      <use xlinkHref='/icons/sprite.svg#icon-token-auditing'></use>
                    </svg>
                  </span>
                  <p className='tool_div_text token_auditing_text'>
                    Token Auditing
                  </p>
                </div>
              </div>
              <div className='tools_row'>
                <div className='tool_div tool_div_border_rigth'>
                  <span className='icon_box'>
                    <svg>
                      <use xlinkHref='/icons/sprite.svg#icon-token-presale'></use>
                    </svg>
                  </span>
                  <p className='tool_div_text token_presale_text'>
                    Token Presale
                  </p>
                </div>
                <div className='tool_div tool_div_border_rigth'>
                  <span className='icon_box'>
                    <svg>
                      <use xlinkHref='/icons/sprite.svg#icon-nft'></use>
                    </svg>
                  </span>
                  <p className='tool_div_text nft_creation_text'>
                    NFT Creation
                  </p>
                </div>
                <div className='tool_div'>
                  <span className='icon_box'>
                    <svg>
                      <use xlinkHref='/icons/sprite.svg#icon-whitepaper'></use>
                    </svg>
                  </span>
                  <p className='tool_div_text whitepaper_creation_text'>
                    NFT Creation
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* <Widgets /> */}
          <div style={{width:285}}></div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default IndexPage
