const NTULearnToken = artifacts.require("NTULearnToken");

module.exports = function (deployer) {
  // deployer is an object provided by Truffle to handle migration
  deployer.deploy(NTULearnToken, 10000000); // now, we ask deployer to deploy our contract
};