import Head from 'next/head'
import React,{useState} from 'react'
import { Navbar } from '../../components/navbar/navbar'
import { Sidebar } from '../../components/sidebar/sidebar'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const index = () => {
    const [startDate, setStartDate] = useState(new Date());
    // const [startDate1, setStartDate1] = useState(new Date()-31);
    // const [startDate2, setStartDate2] = useState(new Date() + 31);
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
        <div className='aboutCenterSection consultation'>
          <h1 className='aboutusH1'>Free Consultation</h1>
          <h3 className='aboutusH3'>We are here to support your creation</h3>
          <div
            style={{ position: 'relative' }}
            className='aboutCardsContainer '
          >
            <DatePicker selected={startDate} className="first-calendar" inline />
            <DatePicker selected={startDate.setDate(0)}  inline className="second-calendar"/>
            <DatePicker selected={startDate.setDate(0)}  inline className="third-calendar"/>
            <img className='aboutEllipse2' src='/images/Ellipse-2.png' />
            <img className='aboutEllipse1' src='/images/Ellipse-1.png' />
          </div>
          <div style={{display:"flex", justifyContent:"center",alignItems:"center"}}>
          <div className='audit-coin-address-section border-left-before bg-big-card' style={{width:"100%",marginRight:25,marginLeft:5}}>
              <span className='audit-coin-address'><span>Mint Amount</span> <span style={{marginLeft:"190px"}}>Mint recipient</span></span>
              <span className='audit-coin-address-value'>
                <span>100</span>
                <span style={{marginLeft:"230px"}}>@JohnDoe</span>
              </span>
              <div className='input-divider-right' style={{right:"15%"}} />
            <span className='input-searchtext-right'>Mint</span>
            </div>
            <div className='audit-tokenname-section token-minting-bg-card'>
                {' '}
                <span className='audit-coin-name-abbrevation'>
                Your Balance
                </span>
                <span className='audit-coin-name-abbrevation-value'>1000000.00</span>
              </div>
        </div>
        <div style={{display:"flex", justifyContent:"center"}}>
            <button className="token-manager" style={{maxWidth:250}} >Continue</button>
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
