import './App.css';
import * as auction from './DutchAuction.js';
import detectEthereumProvider from "@metamask/detect-provider";
import { useState, useRef, useEffect, Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myAddr: null,
      bidAmt: 1000
    };
    
    this.handleTokenCount = this.handleTokenCount.bind(this);
    this.handleAllTokenCount = this.handleAllTokenCount.bind(this);
    this.handleMyAddress = this.handleMyAddress.bind(this);
    this.handleMakeAuction = this.handleMakeAuction.bind(this);
    this.handleCheckStage = this.handleCheckStage.bind(this);
    this.handleSupply = this.handleSupply.bind(this);
    this.handleTime = this.handleTime.bind(this);
    this.handlePrice = this.handlePrice.bind(this);
    this.handleSetup = this.handleSetup.bind(this);
    this.handleApprove = this.handleApprove.bind(this);
    this.handleBid = this.handleBid.bind(this);
    this.handleClaim = this.handleClaim.bind(this);
    this.handleStart = this.handleStart.bind(this);
  }

  handleMyAddress = async () => {
    const provider = await detectEthereumProvider();
    let addr = await provider.selectedAddress;
    this.setState({ myAddr: addr });
  };

  handleTokenCount = async () => {
    if (this.state.myAddr)
      var result = await auction.tokenCount(this.state.myAddr);
    console.log(result);
  };

  handleAllTokenCount = async () => {
    let result = await auction.allTokenCount();
    console.log(result);
  };

  handleMakeAuction = async () => {
    if (this.state.myAddr)
      await auction.makeAuction (this.state.myAddr, 10, 5);
  };

  handleCheckStage = async () => {
    let result = await auction.checkStage();
    console.log(result);
  };

  handleSupply = async () => {
    let result = await auction.supply();
    console.log(result);
  }

  handleTime = async () => {
    let result = await auction.checkTime();
    console.log(result);
  }

  handlePrice = async () => {
    let result = await auction.checkPrice();
    console.log(result);
  }

  handleSetup = async () => {
    await auction.setupToken();
  }

  handleApprove = async () => {
    await auction.approveToken();
  }

  handleStart = async () => {
    await auction.beginAuction();
  }

  handleBid = async () => {
    await auction.bidAuction(this.bidAmt);
  }

  handleClaim = async () => {
    await auction.claimMyTokens();
  }

  render(){
      return (
      <div className="App">
        <h1>Learntoken Dutch Auction</h1>
        <button onClick={this.handleTokenCount}>Token Count</button>
        <button onClick={this.handleAllTokenCount}>All Token Count</button>
        <button onClick={this.handleMyAddress}>Address</button>
        <button onClick={this.handleMakeAuction}>Start Auction (Only Owner)</button>
        <button onClick={this.handleSetup}>Setup (Only Owner)</button>
        <button onClick={this.handleApprove}>Approve (Only Owner)</button>
        <button onClick={this.handleStart}>Start (Only Owner)</button>
        <button onClick={this.handleCheckStage}>Stage?</button>
        <button onClick={this.handleSupply}>Supply</button>
        <button onClick={this.handleTime}>Time</button>
        <button onClick={this.handlePrice}>Price</button>
        <button onClick={this.handleBid}>Bid</button>
        <button onClick={this.handleClaim}>Claim</button>


      </div>
      );
    }
}

export default App;
