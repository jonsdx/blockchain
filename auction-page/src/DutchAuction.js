import detectEthereumProvider from "@metamask/detect-provider";
// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// importing a compiled contract artifact which contains function signature etc. to interact
import artifact_auc from "./DutchAuction.json";
// import artifact_tok from "../build/contracts/NTULearnToken.json";
import artifact_tok from "./NTULearnToken.json";

const infuraWSS = `wss://ropsten.infura.io/ws/v3/f310feadf7c04024996d4c13a1fd0fbc`; // PLEASE CHANGE IT TO YOURS

export const ContractAddress = "0xDb73eAb00C08E3e49aB788D4f140E1F0b6935452";
export const TokenAddress = "0x86e6377105e6aa3dCF4A1c2955146b5b0CA0cF13";
export const Testnet = "ropsten";

// const web3 = new Web3(
//   Web3.currentProvider || new Web3.providers.WebsocketProvider(infuraWSS)
// );
export const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))
// doc here: https://web3js.readthedocs.io/en/v1.2.11/web3.html#providers
const contract = new web3.eth.Contract(artifact_auc.abi, ContractAddress);
const token = new web3.eth.Contract(artifact_tok.abi, TokenAddress);

// const provider = detectEthereumProvider().then((p) => {
//   if (p) {
//     console.log(p !== window.ethereum)
//   }
// });


export const makeAuction = async (wallet, startPrice, clearPrice) => {
  const provider = await detectEthereumProvider();
  if (provider) {
    console.log(provider !== window.ethereum)
    provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: provider.selectedAddress,
          to: ContractAddress,
          value: 0,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: "CreateAuction",
              type: "function",
              inputs: [wallet, startPrice, clearPrice],
            },
            []
          ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
          chainId: 3,
        },
      ],
    });

    let stage = await contract.methods.checkStage().call();
    if (stage === 0)
      console.log("Auction created successfully!");
    else if (stage > 0) {
      console.log("Auction already created!");
    } else {
      console.log("Auction creation failed");
    }

  } else {
    console.log("Please install MetaMask!");
  }
}

export const checkStage = async () => {
  let stage = await contract.methods.checkStage().call();
  return stage;
}

export const checkTime = async () => {
  let time = await contract.methods.timeLeft().call();
  return time;
}

export const checkPrice = async () => {
  // Price in wei
  let price = await contract.methods.calcCurrentTokenPrice().call();
  return price;
}

export const supply = async () => {
  let tokenSupply = await contract.methods.tokensLeft().call();
  return tokenSupply;
}

export const tokenCount = async (anAddress) => {
  let tokens = await token.methods.balanceOf(anAddress).call();
  return tokens;
}

export const allTokenCount = async () => {
  let allTokens = await token.methods.totalSupply().call();
  return allTokens;
}

export const setupToken = async () => {
  await contract.methods.setup(TokenAddress);
  await token.methods.approve(ContractAddress, 10000000);
  const provider = await detectEthereumProvider();
  if (provider) {
    provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: provider.selectedAddress,
          to: TokenAddress,
          value: 0,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: "approve",
              type: "function",
              inputs: [ContractAddress, 10000000],
            },
            []
          ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
          chainId: 3,
        },
      ],
    });
  } else {
    console.log("Please install MetaMask!");
  }
  let stage = await contract.methods.checkStage().call();
  if (stage === 1) {
    console.log("Token set up successfully!");
  }
  else if (stage > 1) {
    console.log("Token already setup!");
  } else {
    console.log("Token set up failed");
  }
}

export const beginAuction = async () => {
  await contract.methods.startAuction();
  let stage = await contract.methods.checkStage().call();
  if (stage == 2)
    console.log("Auction started!");
  else if (stage > 2) {
    console.log("Auction already ended!");
  } else {
    console.log("Auction failed to start");
  }
}

export const claimMyTokens = async () => {
  const provider = await detectEthereumProvider();
  if (provider) {
    provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: provider.selectedAddress,
          to: ContractAddress,
          value: 0,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: "claimTokens",
              type: "function",
              inputs: [provider.selectedAddress],
            },
            []
          ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
          chainId: 3,
        },
      ],
    });
  } else {
    console.log("Please install MetaMask!");
  }
}

export const bidAuction = async (bidAmt) => {
  const provider = await detectEthereumProvider();
  if (provider) {
    provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: provider.selectedAddress,
          to: ContractAddress,
          value: bidAmt,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: "bid",
              type: "function",
              inputs: [provider.selectedAddress],
            },
            []
          ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
          chainId: 3,
        },
      ],
    });
  } else {
    console.log("Please install MetaMask!");
  }
}



