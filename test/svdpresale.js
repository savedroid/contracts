import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMRevert from './helpers/EVMRevert'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const SvdPreSale = artifacts.require('SvdPreSale');

contract('SvdPreSale', function ([_, investor, wallet, purchaser, whitelister]) {

  const minWei = ether('0.01');
  const maxWei = ether('10');

  const value = ether(2)

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime =   this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1);

    this.crowdsale = await SvdPreSale.new(
      this.startTime,
      this.endTime,
      minWei,
      maxWei,
      whitelister,
      wallet);

    await this.crowdsale.setInvestorWhitelist(investor, true, {from: whitelister});
  })

  it('should be token owner', async function () {
    const owner = await this.crowdsale.owner();
    owner.should.equal(_);
  })

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasEnded()
    ended.should.equal(false)
    await increaseTimeTo(this.afterEndTime)
    ended = await this.crowdsale.hasEnded()
    ended.should.equal(true)
  })

  describe('whitelist', function () {

    it('should only allow whitelister to change whitelist', async function () {
      await this.crowdsale.setInvestorWhitelist(purchaser, true).should.be.rejectedWith(EVMRevert);
    })

    it('whitelist can be reverted', async function () {
      await increaseTimeTo(this.startTime)
      await this.crowdsale.setInvestorWhitelist(investor, false, {from: whitelister});
      await this.crowdsale.sendTransaction({value: value, from: investor}).should.be.rejectedWith(EVMRevert)
    })

    it('should log whitelist', async function () {
      const {logs} = await this.crowdsale.setInvestorWhitelist(purchaser, true, {from: whitelister})

      const event = logs.find(e => e.event === 'Whitelisted')

      should.exist(event)
      event.args.investor.should.equal(purchaser)
      event.args.status.should.equal(true)
    })
  })


  describe('accepting payments', function () {

    it('should reject payments before start', async function () {
      await this.crowdsale.sendTransaction({value: value, from: investor}).should.be.rejectedWith(EVMRevert)
      await this.crowdsale.buyTokens(investor, {from: purchaser, value: value}).should.be.rejectedWith(EVMRevert)
    })

    it('should accept payments after start', async function () {
      await increaseTimeTo(this.startTime)
      await this.crowdsale.sendTransaction({value: value, from: investor}).should.be.fulfilled
      await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.fulfilled
    })

    it('should reject payments after end', async function () {
      await increaseTimeTo(this.afterEndTime)
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert)
      await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.rejectedWith(EVMRevert)
    })

    it('should reject non whitelisted addresses', async function () {
      await this.crowdsale.sendTransaction({value: value, from: purchaser}).should.be.rejectedWith(EVMRevert)
      await this.crowdsale.buyTokens(purchaser, {from: purchaser, value: value}).should.be.rejectedWith(EVMRevert)
    })

  })

  describe('high-level purchase', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
    })

    it('should log purchase', async function () {
      const {logs} = await this.crowdsale.sendTransaction({value: value, from: investor})

      const event = logs.find(e => e.event === 'Investment')

      should.exist(event)
      event.args.purchaser.should.equal(investor)
      event.args.beneficiary.should.equal(investor)
      event.args.value.should.be.bignumber.equal(value)
      // web3.toAscii(event.args.fxRate).replace(/\u0000/g, '').should.equal(ethEur)
    })

    it('should increase weiRaised', async function () {
      await this.crowdsale.sendTransaction({value: value, from: investor})
      const weiRaised = await this.crowdsale.weiRaised()
      weiRaised.should.be.bignumber.equal(value)
    })

    it('should track investments of sender', async function () {
      await this.crowdsale.sendTransaction({value: value, from: investor})
      let balance = await this.crowdsale.investments(investor);
      balance.should.be.bignumber.equal(value)
    })

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet)
      await this.crowdsale.sendTransaction({value, from: investor})
      const post = web3.eth.getBalance(wallet)
      post.minus(pre).should.be.bignumber.equal(value)
    })

  })

  describe('low-level purchase', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
    })

    it('should log purchase', async function () {
      const {logs} = await this.crowdsale.buyTokens(investor, {value: value, from: purchaser})

      const event = logs.find(e => e.event === 'Investment')

      should.exist(event)
      event.args.purchaser.should.equal(purchaser)
      event.args.beneficiary.should.equal(investor)
      event.args.value.should.be.bignumber.equal(value)
      // event.args.fxRate.should.be.bignumber.equal(0)
      // web3.toAscii(event.args.fxRate).replace(/\u0000/g, '').should.equal(ethEur)
    })

    it('should increase weiRaised', async function () {
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      const weiRaised = await this.crowdsale.weiRaised()
      weiRaised.should.be.bignumber.equal(value)
    })

    it('should track investments of sender', async function () {
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      let balance = await this.crowdsale.investments(investor);
      balance.should.be.bignumber.equal(value)
    })

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet)
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      const post = web3.eth.getBalance(wallet)
      post.minus(pre).should.be.bignumber.equal(value)
    })

  })

  describe('pauseable', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
      await this.crowdsale.pause()
    })

    it('should log unpause', async function () {
      const {logs} = await this.crowdsale.unpause({from: _})

      const unpauseEvent = logs.find(e => e.event === 'Unpause')
      should.exist(unpauseEvent)

    })

    it('should stop accepting investments when paused', async function () {
      await this.crowdsale.sendTransaction({value: value, from: investor}).should.be.rejectedWith(EVMRevert)
      await this.crowdsale.buyTokens(investor, {from: purchaser, value: value}).should.be.rejectedWith(EVMRevert)
    })

    it('should resume accepting investments when unpaused', async function () {
      await this.crowdsale.unpause()
      await this.crowdsale.sendTransaction({value: value, from: investor}).should.be.fulfilled
      await this.crowdsale.buyTokens(investor, {from: purchaser, value: value}).should.be.fulfilled

    })

    it('only owner can unpause', async function () {
      await this.crowdsale.unpause({from: investor}).should.be.rejectedWith(EVMRevert)
    })

  })

})
