import { useState, useEffect } from 'react';
import './App.css';
import * as da from './DutchAuction'

function App() {
  const [data, setData] = useState({ selectedQuantity: 0, confirmedQuantity: 0, selectedBidPrice: 0, confirmedBidPrice: 0, eth: 0 })
  const [acc, setAcc] = useState(0)
  useEffect(() => {
    if (da.web3.eth) {
      // da.web3.eth.getAccounts(accounts => setAcc(accounts[0]))
      da.web3.eth.getAccounts().then((accs) => console.log(accs[0]))
    }
  }, [da.web3.eth]
  )


  const { selectedQuantity, confirmedQuantity, selectedBidPrice, confirmedBidPrice, eth } = data

  const currency = "Wei"

  const refresh = () => {
    setData((state) => {
      return {
        ...state,
        eth: da.allTokenCount(),
      }
    })
  }

  // const provider = da.allTokenCount().then((p) => {
  //   if (p) {
  //     alert(p)
  //   }
  // });

  // const provider = da.tokenCount().then((p) => {
  //   if (p) {
  //     alert(p)
  //   }
  // });

  // useEffect(() => {
  //   setData((state) => {
  //     return {
  //       ...state,
  //       eth: da.allTokenCount(),
  //     }
  //   })
  // }, [da.allTokenCount()])

  return (
    <div>
      <h1 className="title">NTULearnToken Dutch Auction</h1>
      <div className="content-top">
        <div>
          <form>
            <label>
              NLT Start Price ({currency}):
              <input type="text" name="name" />
            </label>
            <label>
              NLT End Price ({currency}):
              <input type="text" name="name" />
            </label>
            <label>
              Auction Start Time:
              <input type="time" name="time"></input>
            </label>
            <input type="submit" value="Start Auction" />
          </form>
        </div>
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
            <p>Total Value ({currency}): </p>
          </div>
          <br />
          <div className="card--gray">
            <p><u>Your Ethereum</u></p>
            <p>{acc}</p>
          </div>
        </div>
        {/* Column 2 */}
        <div style={{ borderRight: '2px solid gray', borderLeft: '2px solid gray', width: '700px', paddingLeft: '30px', paddingRight: '30px' }}>
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
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {confirmedQuantity === 0 || confirmedBidPrice === 0 ?
              <button
                type="button"
                className="rect-button"
                onClick={() =>
                  setData((state) => {
                    return {
                      ...state,
                      confirmedQuantity: selectedQuantity,
                      confirmedBidPrice: selectedBidPrice
                    }
                  })
                }
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
          <div className="card--gray"><p><u>Remaining NTULearnTokens</u></p><p>15</p></div>
          <br />
          <div className="card--gray"><p><u>Current NLT Price</u></p><p>15 ({currency})</p></div>
          <p><strong className="title">Auction Stage: 3/4</strong></p>
          <p><strong className="title">Stage End Time: 1600</strong></p>
          <p><strong className="title">Auction End Time: 1605</strong></p>
        </div>
        {/* End */}
      </div>
    </div>
  );
}

export default App;
