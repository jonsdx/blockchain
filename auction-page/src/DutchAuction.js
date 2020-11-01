import detectEthereumProvider from "@metamask/detect-provider";
import ethereum from "@metamask/detect-provider";
// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// importing a compiled contract artifact which contains function signature etc. to interact
import artifact_auc from "./Json/DutchAuction.json";
import artifact_tok from "./Json/NTULearnToken.json";

// const infuraWSS = `wss://ropsten.infura.io/ws/v3/f310feadf7c04024996d4c13a1fd0fbc`; // PLEASE CHANGE IT TO YOURS

export const ContractAddress = "0xf4bD0e5e2337138FF6214E777c812Ab96123c8cC";
export const TokenAddress = "0x0036714362B94B408ae052da219571dEE2E56C59";
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

      let stage = await contract.methods.checkStage().call();
      if (stage === 0)
          console.log("Auction created successfully!");
      else if (stage > 0){
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

// export const setupToken = async () => {
//     await contract.methods.setup(TokenAddress);
//     await token.methods.approve(ContractAddress, 10000000);
//     const provider = await detectEthereumProvider();
//     if (provider) {
//         ethereum.request({
//           method: "eth_sendTransaction",
//           params: [
//             {
//               from: ethereum.selectedAddress,
//               to: TokenAddress,
//               value: 0,
//               data: web3.eth.abi.encodeFunctionCall(
//                 {
//                   name: "approve",
//                   type: "function",
//                   inputs: [ContractAddress, 10000000],
//                 },
//                 []
//               ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
//               chainId: 3,
//             },
//           ],
//         })
//         console.log("sent!");
//     } else {
//         console.log("Please install MetaMask!");
//     }
//   let stage = await contract.methods.checkStage().call();
//   if (stage === 1) {
//       console.log("Token set up successfully!");
//   }
//   else if (stage > 1){
//       console.log("Token already setup!");
//   } else {
//       console.log("Token set up failed");
//   }
// }

export const beginAuction = async () => {
    await contract.methods.startAuction();
    let stage = await contract.methods.checkStage().call();
    if (stage === 2)
        console.log("Auction started!");
    else if (stage > 2){
        console.log("Auction already ended!");
    } else {
        console.log("Auction failed to start");
    }
}

// export const claimMyTokens = async () => {
//   const provider = await detectEthereumProvider();
//   if (provider) {
//       ethereum.request({
//         method: "eth_sendTransaction",
//         params: [
//           {
//             from: ethereum.selectedAddress,
//             to: ContractAddress,
//             value: 0,
//             data: web3.eth.abi.encodeFunctionCall(
//               {
//                 name: "claimTokens",
//                 type: "function",
//                 inputs: [ethereum.selectedAddress],
//               },
//               []
//             ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
//             chainId: 3,
//           },
//         ],
//       });
//   } else {
//       console.log("Please install MetaMask!");
//   }
// }

// export const bidAuction = async (bidAmt) => {
//   const provider = await detectEthereumProvider();
//   if (provider) {
//       ethereum.request({
//         method: "eth_sendTransaction",
//         params: [
//           {
//             from: ethereum.selectedAddress,
//             to: ContractAddress,
//             value: bidAmt,
//             data: web3.eth.abi.encodeFunctionCall(
//               {
//                 name: "bid",
//                 type: "function",
//                 inputs: [ethereum.selectedAddress],
//               },
//               []
//             ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
//             chainId: 3,
//           },
//         ],
//       });
//   } else {
//       console.log("Please install MetaMask!");
//   }
// }



