import './App.css';
import * as auction from './DutchAuction.js';
import detectEthereumProvider from "@metamask/detect-provider";
import { useState, useRef, useEffect, Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myAddr: null,
    };
    
    this.handleTokenCount = this.handleTokenCount.bind(this);
    this.handleAllTokenCount = this.handleAllTokenCount.bind(this);
    this.handleMyAddress = this.handleMyAddress.bind(this);
    this.handleMakeAuction = this.handleMakeAuction.bind(this);
    this.handleCheckStage = this.handleCheckStage.bind(this);
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

  render(){
      return (
      <div className="App">
        <h1>Learntoken Dutch Auction</h1>
        <button onClick={this.handleTokenCount}>Token Count</button>
        <button onClick={this.handleAllTokenCount}>All Token Count</button>
        <button onClick={this.handleMyAddress}>Address</button>
        <button onClick={this.handleMakeAuction}>Start Auction (Only Owner)</button>
        <button onClick={this.handleCheckStage}>Stage?</button>


      </div>
      );
    }
}

export default App;
