const DutchAuction = artifacts.require("DutchAuction");

module.exports = function (deployer) {
  // deployer is an object provided by Truffle to handle migration
  deployer.deploy(DutchAuction); // now, we ask deployer to deploy our contract
};