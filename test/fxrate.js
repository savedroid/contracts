import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMRevert from './helpers/EVMRevert'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should()

const FxRates = artifacts.require('FxRates');

contract('FxRates', function ([_, investor, wallet, purchaser, whitelister]) {

  const rate1 = '670.01';
  const rate2 = '620.11';

  const symbol = 'ETHEUR'
  const timestmp = (new Date()).toString()

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    this.rates = await FxRates.new();
  })

  it('should show changed eth rate', async function () {
    await this.rates.updateEthRate(rate1, timestmp)
    let x = await this.rates.getEthRate()
    x[0].should.equal(rate1)
    x[1].should.equal(timestmp)

    await this.rates.updateEthRate(rate2, timestmp)
    let y = await this.rates.getEthRate()
    y[0].should.equal(rate2)
    y[1].should.equal(timestmp)
  })

  it('should show historic eth rate', async function () {
    await this.rates.updateEthRate(rate1, timestmp)
    let x = await this.rates.getEthRate()
    x[0].should.equal(rate1)
    x[1].should.equal(timestmp)

    await this.rates.updateEthRate(rate2, timestmp)
    let y = await this.rates.getHistEthRate(1)

    y[0].should.equal(x[0])
    y[1].should.equal(x[1])
  })

  it('should show last historic eth rate', async function () {
    await this.rates.updateEthRate(rate1, timestmp)
    await this.rates.updateEthRate(rate2, timestmp)

    let x = await this.rates.getEthRate()
    let y = await this.rates.getHistEthRate(2)
    y[0].should.equal(x[0])
    y[1].should.equal(x[1])
  })


  it('should show changed btc rate', async function () {
    await this.rates.updateBtcRate(rate1, timestmp)
    let x = await this.rates.getBtcRate()
    x[0].should.equal(rate1)
    x[1].should.equal(timestmp)

    await this.rates.updateBtcRate(rate2, timestmp)
    let y = await this.rates.getBtcRate()
    y[0].should.equal(rate2)
    y[1].should.equal(timestmp)
  })

  it('should show historic btc rate', async function () {
    await this.rates.updateBtcRate(rate1, timestmp)
    let x = await this.rates.getBtcRate()
    x[0].should.equal(rate1)
    x[1].should.equal(timestmp)

    await this.rates.updateBtcRate(rate2, timestmp)
    let y = await this.rates.getHistBtcRate(1)
    y[0].should.equal(x[0])
    y[1].should.equal(x[1])
  })

  it('should show last historic btc rate', async function () {
    await this.rates.updateBtcRate(rate1, timestmp)
    await this.rates.updateBtcRate(rate2, timestmp)

    let x = await this.rates.getBtcRate()
    let y = await this.rates.getHistBtcRate(2)
    y[0].should.equal(x[0])
    y[1].should.equal(x[1])
  })

  it('should log changed eth rate', async function () {
    const {logs} = await this.rates.updateEthRate(rate1, timestmp)

    const event = logs.find(e => e.event === 'RateUpdate')

    // console.log(t)
    should.exist(event)
    event.args.symbol.should.equal("ETH")
    event.args.updateNumber.should.bignumber.equal(1)
    event.args.timestamp.should.equal(timestmp)
    event.args.rate.should.equal(rate1)

    const numberBtcUpdates = await this.rates.numberBtcUpdates()
    numberBtcUpdates.should.bignumber.equal(0)
    const numberEthUpdates = await this.rates.numberEthUpdates()
    numberEthUpdates.should.bignumber.equal(1)
  })

  it('should log changed btc rate', async function () {
    const {logs} = await this.rates.updateBtcRate(rate1, timestmp)

    const event = logs.find(e => e.event === 'RateUpdate')

    // console.log(t)
    should.exist(event)
    event.args.symbol.should.equal("BTC")
    event.args.updateNumber.should.bignumber.equal(1)
    event.args.timestamp.should.equal(timestmp)
    event.args.rate.should.equal(rate1)

    const numberBtcUpdates = await this.rates.numberBtcUpdates()
    numberBtcUpdates.should.bignumber.equal(1)
    const numberEthUpdates = await this.rates.numberEthUpdates()
    numberEthUpdates.should.bignumber.equal(0)
  })


  it('should only allow owner to change rates', async function () {
    await this.rates.updateEthRate(rate1, timestmp, {from: purchaser}).should.be.rejectedWith(EVMRevert);
    await this.rates.updateBtcRate(rate1, timestmp, {from: purchaser}).should.be.rejectedWith(EVMRevert);
  })

})
