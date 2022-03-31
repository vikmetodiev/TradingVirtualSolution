import Head from 'next/head'
import React from 'react'
import { Navbar } from '../../components/navbar/navbar'
import { Sidebar } from '../../components/sidebar/sidebar'

const owners = [
  {
    name: 'Ramy',
    title: 'President',
    image: '/images/avatar-1.png',
    color: '#41E6FC',
  },
  {
    name: 'Zach',
    title: 'Vice President',
    image: '/images/avatar-2.png',
    color: '#BBFF64',
  },
  {
    name: 'Allie',
    title: 'Strategist Director',
    image: '/images/avatar-3.png',
    color: ' #AD7AFF',
  },
]

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
        <div className='aboutCenterSection'>
          <h1 className='aboutusH1'>About US</h1>
          <h3 className='aboutusH3'>The foundation to support your creation</h3>
          <p className='aboutusP'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ac
            dolor eu dui semper sodales. Integer ultricies sem a maximus
            condimentum. Curabitur feugiat, quam ac finibus tempor, magna nisi
            vehicula ligula, ut elementum nisl ligula non odio. In rhoncus eu
            nisl nec dapibus. Mauris congue posuere pharetra. Suspendisse nunc
            mauris, tempus quis tortor
          </p>
          <div
            style={{ position: 'relative' }}
            className='aboutCardsContainer '
          >
            {owners.map((owner, i) => (
              <div
                key={i}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div className='aboutCards' style={{ zIndex: 9999 }}>
                  <span
                    style={{ background: owner.color }}
                    className='aboutline'
                  />
                  <div className='aboutCardImageSection'>
                    <img className='aboutCardImage' src={owner.image} />
                  </div>
                  <h1 className='aboutCardName'>{owner.name}</h1>
                  <p className='aboutCardTitle'>{owner.title}</p>
                </div>
              </div>
            ))}
            <img className='aboutEllipse2' src='/images/Ellipse-2.png' />
            <img className='aboutEllipse1' src='/images/Ellipse-1.png' />
          </div>
        </div>
      </div>
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
