const SvdToken = artifacts.require("SvdToken");
// const distribution = {
//   //"0x4c8D9dbd58B3Bd7B24314a2987b2F0Bc09cDB5f2": 15,
//   //"0xB56CD69b5A6EC9D4ad36F9Bf4d4b73E46a52fEA1": 4,
//   //"0xD3024d824D05F443253d07a68C4B7d0cA44Db1a3": 0.1,
//   //"0xf9c493c15c370958c61918ca173b8afc355fe9c6": 2,
//   "0x891534370Df30F3c70a6a2F1e63ed8997b832E45": 4.4 * Math.pow(10, 3),
//   "0x5D605Dfd76BFc1D7704DAD14d7d7e91AaB2055E3": 1 * Math.pow(10, 8),
//   "0x030adbb5b6892f9d53dac35afbe74161578e3896": 1 * Math.pow(10, 4),
// }

const distribution = {
  "0x4c8D9dbd58B3Bd7B24314a2987b2F0Bc09cDB5f2": 15,
  "0xB56CD69b5A6EC9D4ad36F9Bf4d4b73E46a52fEA1": 4,
  "0xD3024d824D05F443253d07a68C4B7d0cA44Db1a3": 0.1,
  "0xf9c493c15c370958c61918ca173b8afc355fe9c6": 2,
  "0x891534370Df30F3c70a6a2F1e63ed8997b832E45": 4.4 * Math.pow(10, 3),
  "0x5D605Dfd76BFc1D7704DAD14d7d7e91AaB2055E3": 1 * Math.pow(10, 8),
  "0x030adbb5b6892f9d53dac35afbe74161578e3896": 1 * Math.pow(10, 4),
}

const PRESALE_BONUS = 2;
const GAS_MINT = 90000;


console.log(distribution)

module.exports = function(ending_callback) {
  var token;
  //ChocoToken.deployed().then(token => {
  SvdToken.deployed().then(instance => {
    token = instance;
    return token.decimals()
  })
  .then(decimals => {
    // console.log(token)
    let amounts = Object.keys(distribution).map(a => distribution[a] * Math.pow(10, decimals))
    let addresses = Object.keys(distribution)

    SvdToken.deployed().then(token => {
      return token.batchMint(addresses, amounts)
    })
    .then(tx => {
      console.log(tx)
      if (tx.receipt.status === '0x0') {
        throw 'transaction failed';
      }
      console.log(`Successfully minted ${amounts} to ${addresses}`);
      console.log(`Gas used ${tx.receipt.gasUsed}`);
    })
    .catch(err => console.log(`FAILED to mint ${amounts} to ${addresses}:`, err));
  });
}
