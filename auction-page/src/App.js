import { useState, useEffect } from 'react';
import detectEthereumProvider from "@metamask/detect-provider";

import './App.css';
import * as da from './DutchAuction'

const currency = "Wei"
let owner = ['']

const App = () => {

  // ---------- set up ----------
  const [data, setData] = useState({
    selectedQuantity: 0, confirmedQuantity: 0, selectedBidPrice: 0, confirmedBidPrice: 0,
    eth: 0, acc: 0, total: 0, remain: 0, userTokens: 0, price: 0, timeLeft: 0, stage: 0,
    startPrice: 0, endPrice: 0,
  })
  const { selectedQuantity, confirmedQuantity, selectedBidPrice, confirmedBidPrice,
    eth, acc, total, remain, userTokens, price, timeLeft, stage, startPrice, endPrice } = data

  const { web3, allTokenCount, supply, checkPrice, checkTime, checkStage, tokenCount, makeAuction,
    beginAuction, bidAuction, claimMyTokens, setupToken, endAuction, approveToken } = da

  // ---------- refresh function ----------
  const refresh = async () => {
    const p = await detectEthereumProvider();
    owner = await web3.eth.getAccounts()
    console.log(owner[0].toLowerCase())
    const acc1 = await p.selectedAddress
    console.log(acc1)
    const [eth1, userTokens1] = [await web3.eth.getBalance(acc1), await tokenCount(acc1)];
    const [total1, price1, timeLeft1, stage1] = [await allTokenCount(), await checkPrice(), await checkTime(), await checkStage()];
    setData((state) => {
      return {
        ...state,
        acc: acc1,
        eth: eth1,
        total: total1,
        // remain: remain1,
        userTokens: userTokens1,
        price: price1,
        timeLeft: timeLeft1,
        stage: stage1
      }
    })

  }

  // ---------- start auction functions ----------
  const startAuction = async () => {
    console.log(acc)
    console.log(startPrice)
    console.log(endPrice)
    await makeAuction(acc, startPrice, endPrice)
  }

  const setupToken1 = async () => {
    await setupToken()
  }

  const approveToken1 = async () => {
    await approveToken()
  }

  const beginAuction1 = async () => {
    await beginAuction()
  }

  // ---------- input auction functions ----------
  const inputStartPrice = (v) => {
    setData((state) => {
      return {
        ...state,
        startPrice: v.target.value
      }
    })
  }

  const inputEndPrice = (v) => {
    setData((state) => {
      return {
        ...state,
        endPrice: v.target.value
      }
    })
  }

  const bid = async () => {
    setData((state) => {
      return {
        ...state,
        confirmedQuantity: selectedQuantity,
        confirmedBidPrice: selectedBidPrice
      }
    });
    const value = selectedBidPrice * selectedQuantity
    console.log(value)
    console.log(acc)
    await bidAuction(value.toString())
  }

  // ---------- end of auction ----------
  const end = async () => {
    await endAuction()
  }

  const claim = async () => {
    await claimMyTokens()
  }

  return (
    <div>
      <h1 className="title">NTULearnToken Dutch Auction</h1>
      <div className="content-top">
        {acc === owner[0].toLowerCase() &&
          <span>
            <div>
              <form>
                <label>
                  NLT Start Price ({currency}):
              <input type="text" onChange={(v) => inputStartPrice(v)} />
                </label>
                <br />
                <label>
                  NLT End Price ({currency}):
              <input type="text" onChange={(v) => inputEndPrice(v)} />
                </label>
                <br />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="rect-button" type="button" onClick={startAuction}> Make Auction</button>
                  <button className="rect-button" type="button" onClick={setupToken1}> Set Up Tokens</button>
                  <button className="rect-button" type="button" onClick={approveToken1}> Approve </button>
                  <button className="rect-button" type="button" onClick={beginAuction1}> Start Auction</button>
                  <button
                    type="button"
                    className="rect-button"
                    onClick={end}
                  >End</button>
                </div>
              </form>
            </div>
          </span>}
        <button
          type="button"
          className="rect-button"
          onClick={refresh}
        >Refresh</button>
      </div>
      <div className="content">
        {/* Column 1 */}
        <div>
          <div className="card--gray">
            <p><u>Your NTULearnTokens</u></p>
            <p>Token Quantity: </p>
            <span className="impt">{userTokens}</span>
          </div>
          <br />
          <div className="card--gray">
            <p><u>Your Ethereum</u></p>
            <p>value ({currency}): </p>
            <span className="impt">{eth}</span>
          </div>
          <br />
          <button
            type="button"
            className="rect-button"
            onClick={claim}
          >Claim Tokens</button>
        </div>
        {/* Column 2 */}
        <div style={{ border: '2px solid gray', width: '700px', paddingLeft: '30px', paddingRight: '30px' }}>
          <p><strong className="title">Select Quantity</strong></p>
          <div className="select-quantity">
            <button
              type="button"
              className={
                selectedQuantity <= 0
                  ? 'disappear'
                  : 'round-button'
              }
              disabled={selectedQuantity <= 0}
              onClick={() =>
                setData((state) => {
                  return {
                    ...state,
                    selectedQuantity: selectedQuantity - 1,
                  }
                })
              }
            >
              Minus
            </button>
            <p>{selectedQuantity}</p>
            <button
              type="button"
              className="round-button"
              onClick={() =>
                setData((state) => {
                  return {
                    ...state,
                    selectedQuantity: selectedQuantity + 1,
                  }
                })
              }
            >
              Plus
            </button>
          </div>
          <p><strong className="title">Select Bid Price ({currency})</strong></p>
          <div className="select-quantity">
            <button
              type="button"
              className={
                selectedBidPrice <= 0
                  ? 'disappear'
                  : 'round-button'
              }
              disabled={selectedBidPrice <= 0}
              onClick={() =>
                setData((state) => {
                  return {
                    ...state,
                    selectedBidPrice: selectedBidPrice - 1,
                  }
                })
              }
            >
              Minus
            </button>
            <p>{selectedBidPrice}</p>
            <button
              type="button"
              className="round-button"
              onClick={() =>
                setData((state) => {
                  return {
                    ...state,
                    selectedBidPrice: selectedBidPrice + 1,
                  }
                })
              }
            >
              Plus
            </button>
          </div>
          <br />
          <p className="title">address: <span className="impt">{acc}</span></p>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {confirmedQuantity === 0 || confirmedBidPrice === 0 ?
              <button
                type="button"
                className="rect-button"
                onClick={bid}
              >Bid</button> :
              <div>
                <p>Confirmed Quantity: {confirmedQuantity}</p>
                <p>Confirmed Bid Price: {confirmedBidPrice} ({currency})</p>
                <p>Confirmed Total Price: {confirmedQuantity * confirmedBidPrice} ({currency})</p>
                <button
                  type="button"
                  className="rect-button"
                  onClick={() =>
                    setData((state) => {
                      return {
                        ...state,
                        confirmedQuantity: 0,
                        confirmedBidPrice: 0
                      }
                    })
                  }
                >
                  Clear</button>
              </div>}
          </div>
        </div>
        {/* Column 3 */}
        <div>
          <div className="card--gray"><p><u>NTULearnTokens Supply</u></p><span className="impt">{remain}</span></div>
          <br />
          <div className="card--gray"><p><u>Current NLT Price</u></p><p><span className="impt">{price}</span> ({currency})</p></div>
          <p><strong className="title">Total Tokens: <span className="impt">{total}</span></strong></p>
          <p><strong className="title">Auction Stage: <span className="impt">{stage}</span>/3</strong></p>
          <p><strong className="title">Time Left: {{ timeLeft } > 1201 && <span className="impt">{timeLeft}</span>}</strong></p>
        </div>
        {/* End */}
      </div>
    </div>
  );
}

export default App;
