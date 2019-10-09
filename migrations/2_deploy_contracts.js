var FDT_ETHExtension = artifacts.require("FDT_ETHExtension");

module.exports = function(deployer) {
  deployer.deploy(FDT_ETHExtension, "MSC", "Musicakes");

};
