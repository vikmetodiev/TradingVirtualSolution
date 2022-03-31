import { ChainId, useEthers } from '@usedapp/core'
import { ContractFactory } from 'ethers'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Footer } from '../components/footer'
import { BuilderSidebar } from '../components/sidebar/buildersidebar'
import { Widgets } from '../components/widgets/widgets'
import { DEFAULT_DEFLATION } from '../constants/tokenBuilder'
import { IERC20TokenProps } from '../interfaces/IERC20TokenProps'
import Modal from '../components/modal/Modal'
import Link from 'next/link'
import { parseEther } from '@ethersproject/units'
import { useToasts } from 'react-toast-notifications'
import { TOKEN_DEPLOY_CHARGE } from '../constants/system'
import { Navbar } from '../components/navbar/navbar'
const BuilderPage: NextPage = () => {
  const { account, library, chainId } = useEthers()
  const { addToast, removeAllToasts } = useToasts()

  const [configSet, setConfigSet] = useState<IERC20TokenProps>({
    chainId: ChainId.Rinkeby,
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
    owner: '',
    blacklist: false,
    canBurn: false,
    canMint: false,
    canPause: false,
    initialSupply: '10000',
  })

  const [loading, setLoading] = useState(false)
  const [tokenManager, setTokenManager] = useState(false);
  const [deployedContract, setDeployedContract] = useState<{
    address: string
  } | null>(null)

  useEffect(() => {
    setConfigSet((c) => ({
      ...c,
      chainId: chainId,
    }))
  }, [chainId])

  const [editorProps, setEditorProps] = useState({
    customOwner: false,
  })

  useEffect(() => {
    if (account) {
      setConfigSet((c) => ({
        ...c,
        owner: account,
      }))
    }
  }, [account])

  const onDeployClick = (e: React.FormEvent<HTMLFormElement>) => {
    addToast('Preparing smart contract.', {
      appearance: 'info',
      autoDismiss: false,
    })
    e.preventDefault()
    setLoading(true)
    fetch('/api/token/code', {
      method: 'POST',
      body: JSON.stringify(configSet),
    })
      .then((res) => res.json())
      .catch((err) => {})
      .then((res: undefined | ContractFile) => {
        removeAllToasts()
        if (res) {
          const abi = res.abi
          const bytecode = res.evm?.bytecode?.object
          if (abi && bytecode)
            addToast('Deploying contract.', {
              appearance: 'info',
              autoDismiss: false,
            })
          else
            addToast('Failed to compile contract.', {
              appearance: 'error',
            })
          const factory = new ContractFactory(
            abi,
            bytecode,
            library?.getSigner?.(account) as any
          )

          factory
            .deploy({ value: parseEther(TOKEN_DEPLOY_CHARGE[chainId]) })
            .then((contract) => {
              contract.deployed().then((ctr) => {
                removeAllToasts()
                setDeployedContract({ address: ctr.address })
              })
            })
            .catch((err) => {
              removeAllToasts()
              addToast('Failed to deploy.', {
                appearance: 'error',
              })
            })
        }
      })
  }

  return (
    <div id='wrapper' className="minting-wrapper">
      <Head>
        <title>Virtual Trading Solutions</title>
        <meta name='description' content='Virtual Trading Solutions website.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <img src="/images/bg-3.png" className="auditing-bg-image"/>
      <Navbar buttonClass={"token-button"}/>

      <main id='main'>
        <div className='container container-builder'>
          <BuilderSidebar />


         {!tokenManager ? <section className='minter'>
          <div style={{marginBottom:15}}>
          <h1 style={{textAlign:"center"}} className="token-minting">Token <span>Minting</span></h1>
            <h1 style={{textAlign:"center"}} className="token-headline"> Further develop your creation by minting tokens in a matter of minutes.</h1>
            </div>
            <div className='minter__left'>

              <ul>
                <li>
                  <a href='#' className='active-tab'>
                    ERC20 Ethereum
                  </a>
                </li>
                <li>
                  <a href='#'>BEP20 Binance</a>
                </li>
              </ul>

              <a href='/manage/token'>
                <button className='btn-basic' style={{ margin: 20 }}>
                  Manage Existing Token
                </button>
              </a>

              <form action='' onSubmit={onDeployClick}>
                <div className='input-button'>
                  <label htmlFor=''>Token Name</label>
                  <input
                    type='text'
                    defaultValue={configSet.name}
                    onChange={(e) => {
                      setConfigSet((c) => ({
                        ...c,
                        name: e.target.value,
                      }))
                    }}
                  />
                </div>

                <div className='input-group'>
                  <label htmlFor=''>Token Symbol</label>
                  <input
                    type='text'
                    defaultValue={configSet.symbol}
                    onChange={(e) => {
                      setConfigSet((c) => ({
                        ...c,
                        symbol: e.target.value,
                      }))
                    }}
                  />
                </div>

                <div className='input-subgroup'>
                  <div className='input-button'>
                    <label htmlFor=''>Decimals</label>
                    <input
                      type='number'
                      defaultValue={configSet.decimals}
                      onChange={(e) => {
                        setConfigSet((c) => ({
                          ...c,
                          decimals: +e.target.value,
                        }))
                      }}
                    />
                  </div>

                  <div className='input-group'>
                    <label htmlFor=''>Initial Supply</label>
                    <input
                      type='number'
                      defaultValue={configSet.initialSupply.toString()}
                      onChange={(e) => {
                        setConfigSet((c) => ({
                          ...c,
                          initialSupply: e.target.value,
                        }))
                      }}
                    />
                  </div>
                </div>

                {editorProps.customOwner ? (
                  <div className='input-group'>
                    <label htmlFor=''>Owner</label>
                    <input
                      type='text'
                      defaultValue={account}
                      onChange={(e) => {
                        setConfigSet((c) => ({
                          ...c,
                          owner: e.target.value,
                        }))
                      }}
                    />
                  </div>
                ) : null}

                {!!configSet.deflation && (
                  <>
                    {/* <div className="input-group">
                      <label htmlFor="">Tax Receiver Address</label>
                      <input
                        type="text"
                        defaultValue={configSet.symbol}
                        onChange={(e) => {
                          setConfigSet((c) => ({
                            ...c,
                            deflation: {
                              taxReceiverAddress: e.target.value
                            }
                          }));
                        }}
                      />
                    </div> */}
                    <div className='input-group'>
                      <label htmlFor=''>Holders Reward Fee</label>
                      <input
                        className='percent-input'
                        type='number'
                        min={0}
                        max={100}
                        defaultValue={configSet.deflation.holdersRewardPercent}
                        onChange={(e) => {
                          setConfigSet((c) => ({
                            ...c,
                            deflation: {
                              ...c.deflation,
                              holdersRewardPercent: +e.target.value,
                            },
                          }))
                        }}
                      />
                      %
                    </div>
                    <div className='input-group'>
                      <label htmlFor=''>Automatic LP</label>
                      <input
                        className='percent-input'
                        type='number'
                        min={0}
                        max={100}
                        defaultValue={configSet.deflation.autoLPPercent}
                        onChange={(e) => {
                          setConfigSet((c) => ({
                            ...c,
                            deflation: {
                              ...c.deflation,
                              autoLPPercent: +e.target.value,
                            },
                          }))
                        }}
                      />
                      %
                    </div>
                    <div className='input-group'>
                      <label htmlFor=''>Transaction Tax</label>
                      <input
                        className='percent-input'
                        type='number'
                        min={0}
                        max={100}
                        defaultValue={configSet.deflation.taxPercent}
                        onChange={(e) => {
                          setConfigSet((c) => ({
                            ...c,
                            deflation: {
                              ...c.deflation,
                              taxPercent: +e.target.value,
                            },
                          }))
                        }}
                      />
                      %
                    </div>
                    <div className='input-group'>
                      <label htmlFor=''>BuyBack Tax</label>
                      <input
                        className='percent-input'
                        type='number'
                        min={0}
                        max={100}
                        defaultValue={configSet.deflation.buyBackTax}
                        onChange={(e) => {
                          setConfigSet((c) => ({
                            ...c,
                            deflation: {
                              ...c.deflation,
                              buyBackTax: +e.target.value,
                            },
                          }))
                        }}
                      />
                      %
                    </div>
                  </>
                )}

                <div className='build-btn'>
                  <button type='submit'>
                    <span>DEPLOY TOKEN</span>{' '}
                  </button>
                  {/* <button type="button">
                    Advanced Features
                    <svg>
                      <use xlinkHref="/icons/sprite.svg#icon-arrow-right"></use>
                    </svg>
                  </button> */}
                </div>
              </form>
            </div>

            <div className='minter__right'>
              <ul>
                <li>
                  <p className='setting-name'>Can Mint</p>
                  <p className='setting-detail'>Can Mint</p>

                  <div className='toggle-secondary'>
                    <input
                      type='checkbox'
                      name=''
                      id='toggle-1'
                      onChange={(e) => {
                        setConfigSet((c) => ({
                          ...c,
                          canMint: e.target.checked,
                        }))
                      }}
                    />
                    <label htmlFor='toggle-1'>
                      <span className='toggle-inner'></span>
                      <span className='toggle-button'></span>
                    </label>
                  </div>
                </li>

                <li>
                  <p className='setting-name'>Can Burn</p>
                  <p className='setting-detail'>Can Burn</p>

                  <div className='toggle-secondary'>
                    <input
                      type='checkbox'
                      name=''
                      id='toggle-2'
                      onChange={(e) => {
                        setConfigSet((c) => ({
                          ...c,
                          canBurn: e.target.checked,
                        }))
                      }}
                    />
                    <label htmlFor='toggle-2'>
                      <span className='toggle-inner'></span>
                      <span className='toggle-button'></span>
                    </label>
                  </div>
                </li>

                <li>
                  <p className='setting-name'>Can Pause</p>
                  <p className='setting-detail'>Owner Can Pause on demand</p>

                  <div className='toggle-secondary'>
                    <input
                      type='checkbox'
                      name=''
                      id='toggle-3'
                      onChange={(e) => {
                        setConfigSet((c) => ({
                          ...c,
                          canPause: e.target.checked,
                        }))
                      }}
                    />
                    <label htmlFor='toggle-3'>
                      <span className='toggle-inner'></span>
                      <span className='toggle-button'></span>
                    </label>
                  </div>
                </li>

                <li>
                  <p className='setting-name'>Blacklist</p>
                  <p className='setting-detail'>Blacklist</p>

                  <div className='toggle-secondary'>
                    <input
                      type='checkbox'
                      name=''
                      id='toggle-4'
                      onChange={(e) => {
                        setConfigSet((c) => ({
                          ...c,
                          blacklist: e.target.checked,
                        }))
                      }}
                    />
                    <label htmlFor='toggle-4'>
                      <span className='toggle-inner'></span>
                      <span className='toggle-button'></span>
                    </label>
                  </div>
                </li>

                <li>
                  <p className='setting-name'>Custom Owner</p>
                  <p className='setting-detail'>Mint - Limited Supply Cap</p>

                  <div className='toggle-secondary'>
                    <input
                      type='checkbox'
                      name=''
                      id='toggle-6'
                      onChange={(e) => {
                        setEditorProps((c) => ({
                          ...c,
                          customOwner: e.target.checked,
                        }))
                      }}
                    />
                    <label htmlFor='toggle-6'>
                      <span className='toggle-inner'></span>
                      <span className='toggle-button'></span>
                    </label>
                  </div>
                </li>

                <li>
                  <p className='setting-name'>Deflation</p>
                  <p className='setting-detail'>Burnable</p>

                  <div className='toggle-secondary'>
                    <input
                      type='checkbox'
                      name=''
                      id='toggle-5'
                      checked={!!configSet.deflation}
                      onChange={(e) => {
                        setConfigSet((c) => ({
                          ...c,
                          deflation: c.deflation
                            ? undefined
                            : DEFAULT_DEFLATION(account),
                        }))
                      }}
                    />
                    <label htmlFor='toggle-5'>
                      <span className='toggle-inner'></span>
                      <span className='toggle-button'></span>
                    </label>
                  </div>
                </li>
              </ul>
            </div>
          </section> :    <div className='auditingCenterSection'>
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
      }
                      <div>
          <Widgets />
          <button className="token-manager" onClick={() => setTokenManager(!tokenManager)}>{!tokenManager ? "Token manager": "Token Minting"}</button>
          </div>
        </div>
      </main>
      <Modal
        open={!!deployedContract}
        onClose={() => {
          setDeployedContract(null)
        }}
        title='Contract Deployed'
      >
        <div className='modal__body'>
          Your contract has been deployed to {deployedContract?.address}.<br />
          Click{' '}
          <Link
            href={'/manage/token?address=' + deployedContract?.address}
            passHref
          >
            <a>here</a>
          </Link>{' '}
          to manage.
        </div>
      </Modal>
      <Footer />
    </div>
  )
}

export default BuilderPage
