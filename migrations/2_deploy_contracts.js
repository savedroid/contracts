var SvdPreSale = artifacts.require("./SvdPreSale.sol");
// var SvdMainSale = artifacts.require("./SvdMainSale.sol");
var SvdToken = artifacts.require("./SvdToken.sol");
var FxRates = artifacts.require("./FxRates.sol");

function ether(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'))
}

module.exports = async function(deployer, network, accounts) {

  const startDate = new Date();//new Date(2018, 0, 12, 15, 0, 0);
  const startTime = ((startDate).getTime() / 1000);
  const endDate = new Date(2018, 1, 9, 15, 0, 0);
  const endTime = ((endDate).getTime() / 1000);

  const rate = 1000.0;

  const minWei = ether(10 / rate);
  const maxWei = ether(100000 / rate);
  const minWeiWhitelist = ether(1000 / rate)

  console.log(network, accounts)

  // TODO: change to fit own needs
  const wallet = accounts[0];
  const deployer = accounts[0];
  const whitelister = accounts[0];

  //https://etherconverter.online
  console.log("SvdPreSale -- deploy");

  deployer.deploy(FxRates, {gas: 6721975, from: owner})
  .then((i) => {
    // console.log(startTime, endTime, minWei, maxWei, minWeiWhitelist, whitelister, wallet);
    return deployer.deploy(SvdPreSale, startTime, endTime, minWei, maxWei, minWeiWhitelist, whitelister, wallet)
  })
  .then((i)=>{
    return deployer.deploy(SvdToken)
  })
  // .then((i) => {
  //   return deployer.deploy(SvdMainSale, startTime, endTime, minWei, maxWei, minWeiWhitelist, whitelister, wallet)
  // })
  .then(console.log)
  .catch(console.log)

  console.log("deployment done");
};
