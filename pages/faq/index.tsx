import Head from 'next/head'
import React from 'react'
import { Navbar } from '../../components/navbar/navbar'
import { Sidebar } from '../../components/sidebar/sidebar'

const index = () => {
  return (
    <div className='aboutUs'>
      <Head>
        <title>Virtual Trading Solutions</title>
        <meta name='description' content='Virtual Trading Solutions website.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar />
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
        <div className='aboutCenterSection' style={{zIndex:1}}>
          <h1 className='aboutusH1'>FAQ</h1>
          <h3 className='aboutusH3'>Headlinr goes here</h3>
         
          <div className='auditingCenterSection' >
          
          <div className='auditingmain' style={{paddingTop:30}}>
            <span className='audit-link-address' style={{textAlign:"center",width:"100%",left:0, marginBottom: 10}}>Put email in here to recovery update on When Husband goes live</span>
            <div className='audit-link-address-section' >
              <span className='audit-link-address'>E-mail</span>
              <span className='audit-link-address-value' style={{display:"flex"}}> <img src="/images/Vector.png" style={{marginRight:10}} />Robot@gmail.com</span>
              <div className='input-divider-right' />
            <span className='input-searchtext-right'>CONFRIRM</span>
            </div>
            <div style={{display:"flex", justifyContent:"center"}}>
                <img src="/images/cat.png" style={{width:"100%",marginTop:-150}}/>
            </div>
          </div>
        </div>
        </div>
      </div>
      <img src="/images/Ellipse-56.png" className="first-orb-faq"/>
      <img src="/images/Ellipse-57.png"   className="second-orb-faq"/>
      <div style={{ marginBottom: '20px',paddingLeft:45,paddingRight:45 }} className='aboutCopyright'>
        <div className='copyright'>Copyright</div>
        <div className='socialVectors'>
          <img style={{ marginLeft: '20px' }} src='/images/Vector-1.png' />
          <img style={{ marginLeft: '20px' }} src='/images/Vector-2.png' />
          <img style={{ marginLeft: '20px' }} src='/images/Vector-3.png' />
          <img
            style={{ marginLeft: '20px', marginRight: '20px' }}
            src='/images/Vector-4.png'
          />
        </div>
      </div>
    </div>
  )
}

export default index
