import detectEthereumProvider from "@metamask/detect-provider";
// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// importing a compiled contract artifact which contains function signature etc. to interact
import artifact_auc from "./Json/DutchAuction.json";
import artifact_tok from "./Json/NTULearnToken.json";

// const infuraWSS = `wss://ropsten.infura.io/ws/v3/f310feadf7c04024996d4c13a1fd0fbc`; // PLEASE CHANGE IT TO YOURS

export const ContractAddress = "0xF1A9ebE1596C9f008F66d26aa03cB435797B7b85";
export const TokenAddress = "0x1B12820383f14a8217A92CC20885Fe8123b1f588";
// export const Testnet = "ropsten"; 

// const web3 = new Web3(
//   Web3.currentProvider || new Web3.providers.WebsocketProvider(infuraWSS)
// );

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

// doc here: https://web3js.readthedocs.io/en/v1.2.11/web3.html#providers
const contract = new web3.eth.Contract(artifact_auc.abi, ContractAddress);
const token = new web3.eth.Contract(artifact_tok.abi, TokenAddress);

export const makeAuction = async (wallet, startPrice, clearPrice) => {
    console.log("running");
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
                name: "CreateAuction",
                type: "function",
                inputs: [
                  {
                    type: 'address',
                    name: '_wallet'
                  },{
                    type: 'uint256',
                    name: '_startPrice'
                  },{
                    type: 'uint256',
                    name: '_clearPrice'
                  }],
              },
              [wallet, startPrice, clearPrice]
            ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
            chainId: 3,
          },
        ],
      });
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
                  name: "setup",
                  type: "function",
                  inputs: [
                    {
                      type: 'address',
                      name: '_LearnToken'
                    }
                  ],
                },
                [TokenAddress]
              ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
              chainId: 3,
            },
          ],
        })
        console.log("sent!");
    } else {
        console.log("Please install MetaMask!");
    }
}

export const approveToken = async () => {
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
                inputs: [
                  {
                    type: 'address',
                    name: 'spender'
                  },{
                    type: 'uint256',
                    name: 'amount'
                  }
                ],
              },
              [ContractAddress, 10000000]
            ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
            chainId: 3,
          },
        ],
      })
      console.log("sent!");
  } else {
      console.log("Please install MetaMask!");
  }
}

export const beginAuction = async () => {
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
                name: "startAuction",
                type: "function",
                inputs: [],
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
                inputs: [
                  {
                    type: 'address',
                    name: 'receiver'
                  }
                ],
              },
              [provider.selectedAddress]
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
                inputs: [
                  {
                    type: 'address',
                    name: 'receiver'
                  }
                ],
              },
              [provider.selectedAddress]
            ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
            chainId: 3,
          },
        ],
      });
  } else {
      console.log("Please install MetaMask!");
  }
}



