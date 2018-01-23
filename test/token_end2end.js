import assertRevert from './helpers/assertRevert'
import expectThrow from './helpers/expectThrow';
var SvdToken = artifacts.require('SvdToken');
//var SvdVesting = artifacts.require('SvdVesting');
const EVMRevert = require('./helpers/EVMRevert.js')
import latestTime from './helpers/latestTime';
// import { increaseTimeTo, duration } from './helpers/increaseTime';
var t = require('./helpers/increaseTime')

const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('SvdToken End2End', function(accounts) {
  let token;
  let svd = accounts[0];
  let onlineNode = accounts[1];
  let investor1 = accounts[2];
  let investor2 = accounts[3];

  beforeEach(async function() {
    token = await SvdToken.new();
  });

  it('should do minting, finish minting and transfer value', async function() {
    // const result1 = await token.transfer

    // 1. after deployment, give ownership from hardware wallet to online (geth connected) node
    let result = await token.transferOwnership(onlineNode, {from: svd});
    await token.pause({from: onlineNode});

    // 2. do batch minting from geth connected node
    result = await token.batchMint([investor1, investor2], [100, 50], {from: onlineNode});

    // 2.1 owner should not be able to mint
    await expectThrow(token.batchMint([investor1, investor2], [100, 50], {from: svd}) );

    // 2.2 users should not be able to transfer
    await expectThrow(token.transfer(investor1, 10, {from: investor2}));

    // 2.3 minting should not be finished
    let mintingFinished = await token.mintingFinished({from: onlineNode});
    assert.equal(mintingFinished, false);

    // 3 optionally pause the contract before handing it over to the hardware wallet

    mintingFinished = await token.mintingFinished({from: onlineNode});

    // var paused = await token.pause
    assert.equal(mintingFinished, false);
    // console.log("unpause")


    // 4. unpause
    await token.transferOwnership(svd, {from: onlineNode});
    await expectThrow(token.transfer(investor1, 10, {from: investor2}));
    await token.unpause({from: svd});


    // 5. finish minting
    await expectThrow(token.finishMinting({from: onlineNode}));
    await token.finishMinting({from: svd});
    mintingFinished = await token.mintingFinished({from: onlineNode});
    assert.equal(mintingFinished, true);
    // console.log("finish minting")

    // 6. transfers should work
    token.transfer(investor2, 10, {from: investor1})
    let firstAccountBalance = await token.balanceOf(investor1);
    assert.equal(firstAccountBalance, 90);

    let secondAccountBalance = await token.balanceOf(investor2);
    assert.equal(secondAccountBalance, 60);
  });

  /*it('should work with vesting contract', async function() {

    let startTime = latestTime();// + t.duration.minutes(1); //((new Date()).getTime() / 1000);
    let cliff = 200; //t.duration.years(1);
    let duration = 1000; //t.duration.years(2);

    let vesting = await SvdVesting.new(investor1, startTime, cliff, duration, true);
    const amount = 100;
    let result = await token.mint(vesting.address, amount);
    await token.finishMinting();

    let vestingBalance = await token.balanceOf(vesting.address);
    // console.log("balance of vesting token: ", vestingBalance)
    vestingBalance.should.be.bignumber.equal(amount)

    // assert.equal(vestingBalance, 100);

    await t.increaseTimeTo(startTime + 400);
    // console.log('latestTime: ', latestTime(), 'startTime: ', startTime, 'cliff: ', cliff, 'duration: ', duration)
    let x = await vesting.releasableAmount(token.address)//.should.be.fulfilled;
    let y = await vesting.vestedAmount(token.address)//.should.be.fulfilled;
    // console.log(x.toNumber(), y.toNumber(), vestingBalance.toNumber())

    // let result = await token.mint(vesting.address, 100)
    await vesting.release(token.address).should.be.fulfilled;

    vestingBalance = await token.balanceOf(vesting.address);


    let investor1Balance = await token.balanceOf(investor1);
    vestingBalance.add(investor1Balance).should.be.bignumber.equal(amount)
    investor1Balance.should.be.bignumber.above(0)


  })*/


})
