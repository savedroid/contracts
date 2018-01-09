var SvdPreSale = artifacts.require("./SvdPreSale.sol");
var FxRates = artifacts.require("./FxRates.sol");

function ether(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'))
}

module.exports = async function(deployer, network, accounts) {

  const startDate = new Date(2018, 0, 4, 20, 0, 0);
  const startTime = ((startDate).getTime() / 1000); // web3.eth.getBlock(web3.eth.blockNumber).timestamp + 300 // five minutes in the future
  const endDate = new Date(2018, 0, 7, 14, 0, 0);
  const endTime = ((endDate).getTime() / 1000);

  const minWei = ether(0.1);
  const maxWei = ether(100);

  console.log(network, accounts)


  /* current settings for rinkeby */
  const owner = "0x009ae1e9fe05a03b4f7bb2facb9e590c5b0fa935";
  const wallet = owner;
  const whitelister = owner;
  const cap = ether(500);

  if (network === "rinkeby") {
      // owner = accounts[0];
  }



  //https://etherconverter.online
  console.log("SvdPreSale");

  // deployer.deploy(FxRates, {gas: 6721975, from: accounts[0]})
  // .then(() => {
    // return
    //deployer.deploy(FxRates).then(() => {
      deployer.deploy(SvdPreSale, startTime, endTime, minWei, maxWei, whitelister, wallet)
    //})

  // })

  // let rates = await FxRates.deployed()
  //
  // await rates.updateEthRate(rate1, timestmp)
  // await rates.updateBtcRate("12669.24", (new Date()).toString())

  // .then(function() {
  //
  //   return FxRates.deployed()
  // }).then(instance =>
  // ).updateEthRate("826.70", (new Date()).toString())
  // }).then(function(tx){
  //   return FxRates.deployed().updateBtcRate("12669.24", (new Date()).toString())
  // }).then(function(tx) {
  //   return
  // });

  console.log("done");
};
