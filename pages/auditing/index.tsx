import Head from 'next/head'
import React from 'react'
import { Navbar } from '../../components/navbar/navbar'
import { Sidebar } from '../../components/sidebar/sidebar'

const index = () => {
  return (
    <div className='auditing-wrapper'>
      <Head>
        <title>Virtual Trading Solutions</title>
        <meta name='description' content='Virtual Trading Solutions website.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar buttonClass={"auditing-button"}/>
      <div
        className='about'
        style={{
          maxWidth: '95%',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '50px',
        }}
      >
        <div>
          <Sidebar />
        </div>

        <img src="/images/bg-3.png" className="auditing-bg-image"/>
        <div className='auditingCenterSection'>
          <h1 className='auditingH1'>
            Token <span style={{ color: '#41E6FC' }}>Auditing</span>
          </h1>
          <p className='auditingP'>
            Keep your creation safe by obtaining a smart contract audit.
          </p>
          <div className='input-container'>
          <img src="/images/Ellipse-55.png" style={{position:"absolute", top: -94, left:-90}}/>
          <img src="/images/Ellipse-54.png" style={{position:"absolute", top: -63, left:-60}}/>
            <i className=' icon'>
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
          <div className='auditingmain'>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <div className='audit-tokenname-section'>
                <span className='audit-tokenname'>Token Name</span>

                <img className='audit-Ellipse3' src='/images/Ellipse-3.png' />
                <span className='audit-coin-name'>BITCOIN</span>
              </div>
              <div className='audit-tokenname-section'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                  Token Abbreviation
                </span>
                <span className='audit-coin-name-abbrevation-value'>BTC</span>
              </div>
            </div>
            <div className='audit-coin-address-section'>
              <span className='audit-coin-address'>Contact Address:</span>
              <span className='audit-coin-address-value'>
                0x001b23c12ax13k123ab32cb...
              </span>
            </div>
            <div className='audit-link-address-section'>
              <span className='audit-link-address'>Link Address</span>
              <span className='audit-link-address-value'>https://</span>
            </div>
            <div className='audit-total-amount'>
              $ <span style={{ color: '#FFFFFF' }}>500.00</span>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{ marginBottom: '10px', marginTop: '10px' }}
        className='aboutCopyright'
      >
        <div className='copyright'>Copyright</div>
        <div className='socialVectors'>
          <img style={{ marginLeft: '20px' }} src='/images/Vector-1.png' />
          <img
            style={{ marginLeft: '20px', height: '15px' }}
            src='/images/Vector-2.png'
          />
          <img
            style={{ marginLeft: '20px', height: '15px' }}
            src='/images/Vector-3.png'
          />
          <img
            style={{ marginLeft: '20px', marginRight: '20px', height: '15px' }}
            src='/images/Vector-4.png'
          />
        </div>
      </div>
    </div>
  )
}

export default index
