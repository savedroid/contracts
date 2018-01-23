'use strict';


import assertRevert from './helpers/assertRevert'
import expectThrow from './helpers/expectThrow';
var SvdToken = artifacts.require('SvdToken');
const EVMRevert = require('./helpers/EVMRevert.js')

const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('SvdToken Mint', function(accounts) {
  let token;

  beforeEach(async function() {
    token = await SvdToken.new();
  });

  it('should start with a totalSupply of 0', async function() {
    let totalSupply = await token.totalSupply();

    assert.equal(totalSupply, 0);
  });

  it('should start with a cap of 100 x 100 million tokens x 18 decimals', async function() {
    let _cap = await token.CAP();

    assert(_cap.eq(Math.pow(10, 18 + 2 + 6 + 2)));
  });

  it('should return mintingFinished false after construction', async function() {
    let mintingFinished = await token.mintingFinished();

    assert.equal(mintingFinished, false);
  });

  it('should mint a given amount of tokens to a given address', async function() {
    const result = await token.mint(accounts[0], 100);

    assert.equal(result.logs[0].event, 'Mint');
    assert.equal(result.logs[0].args.to.valueOf(), accounts[0]);
    assert.equal(result.logs[0].args.amount.valueOf(), 100);

    assert.equal(result.logs[1].event, 'Transfer');
    assert.equal(result.logs[1].args.from.valueOf(), 0x0);

    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0, 100);

    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 100);
  })


  it('respects the cap', async function() {
    const result = await token.mint(accounts[0], web3.toWei(10000000000));

    try {
      await token.mint(accounts[1], 1);
      assert.fail('should have thrown before');
    } catch (error) {
      assertRevert(error);
    }

    let balance0 = await token.balanceOf(accounts[0]);
    balance0.should.bignumber.equal(web3.toWei(10000000000))
    // console.log(balance0, 10000000000)

    let totalSupply = await token.totalSupply();
    totalSupply.should.bignumber.equal(web3.toWei(10000000000))
  })

  it('should batch mint', async function() {
    // console.log([accounts[0], accounts[1]], [100, 50])
    const result = await token.batchMint([accounts[0], accounts[1]], [100, 50]);

    assert.equal(result.logs[0].event, 'Mint');
    assert.equal(result.logs[0].args.to.valueOf(), accounts[0]);
    assert.equal(result.logs[0].args.amount.valueOf(), 100);

    assert.equal(result.logs[1].event, 'Transfer');
    assert.equal(result.logs[1].args.from.valueOf(), 0x0);

    assert.equal(result.logs[2].event, 'Mint');
    assert.equal(result.logs[2].args.to.valueOf(), accounts[1]);
    assert.equal(result.logs[2].args.amount.valueOf(), 50);

    assert.equal(result.logs[3].event, 'Transfer');
    assert.equal(result.logs[3].args.from.valueOf(), 0x0);

    // console.log(result.logs[3].args)

    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0, 100);

    let balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1, 50);

    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 150);
  })

  it('should fail if arguments to batch mint are uneven length', async function() {
    // console.log([accounts[0], accounts[1]], [100, 50])
    const result = await expectThrow( token.batchMint([accounts[0], accounts[1]], [100]) );

    const result2 = await expectThrow( token.batchMint([accounts[0], accounts[1]], [100, 60, 22]) );

    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0, 0);

    let balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1, 0);

    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 0);
  })

  it('should fail to mint after call to finishMinting', async function () {
    await token.finishMinting();
    assert.equal(await token.mintingFinished(), true);
    await expectThrow(token.batchMint([accounts[0], accounts[1]], [100, 50]));
  })

  it('should fail to batch mint after call to finishMinting', async function () {
    await token.finishMinting();
    assert.equal(await token.mintingFinished(), true);
    await expectThrow(token.mint(accounts[0], 100));
  })

  /* it('should fail to transfer before finishMinting', async function () {
    await token.mint(accounts[0], 100);
    await expectThrow(token.transfer(accounts[1], 100));
  }) */

  it('should be able to transfer before finishMinting', async function () {
    await token.mint(accounts[0], 100);
    await token.transfer(accounts[1], 100);

    let balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1, 100);
  })

})

contract('SvdToken balances', function(accounts) {
  let token;

  beforeEach(async function() {
    token = await SvdToken.new();
    const result = await token.mint(accounts[0], 100);
    const result2 = await token.finishMinting();
  });

  it("should return correct balances after transfer", async function(){
    let transfer = await token.transfer(accounts[1], 100);

    let firstAccountBalance = await token.balanceOf(accounts[0]);
    assert.equal(firstAccountBalance, 0);

    let secondAccountBalance = await token.balanceOf(accounts[1]);
    assert.equal(secondAccountBalance, 100);
  });

  it('should throw an error when trying to transfer more than balance', async function() {
    try {
      let transfer = await token.transfer(accounts[1], 101);
      assert.fail('should have thrown before');
    } catch(error) {
      assertRevert(error);
    }
  });

  it('should throw an error when trying to transfer to 0x0', async function() {
    try {
      let transfer = await token.transfer(0x0, 100);
      assert.fail('should have thrown before');
    } catch(error) {
      assertRevert(error);
    }
  });

});




contract('SvdToken', function(accounts) {
  let token;

  beforeEach(async function() {
    // token = await SvdToken.new(accounts[0], 100);
    token = await SvdToken.new();
    await token.mint(accounts[0], 100);
    await token.finishMinting();
  });

  it('should return paused false after construction', async function() {
    let paused = await token.paused();

    assert.equal(paused, false);
  });

  it('should return paused true after pause', async function() {
    await token.pause();
    let paused = await token.paused();

    assert.equal(paused, true);
  });

  it('should return paused false after pause and unpause', async function() {
    await token.pause();
    await token.unpause();
    let paused = await token.paused();

    assert.equal(paused, false);
  });

  it('should be able to transfer if transfers are unpaused', async function() {
    await token.transfer(accounts[1], 100);
    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0, 0);

    let balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1, 100);
  });

  it('should be able to transfer after transfers are paused and unpaused', async function() {
    await token.pause();
    await token.unpause();
    await token.transfer(accounts[1], 100);
    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0, 0);

    let balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1, 100);
  });

  it('should throw an error trying to mint while transactions are paused', async function() {
    await token.pause();
    try {
      await token.mint(accounts[1], 100);
      assert.fail('should have thrown before');
    } catch (error) {
      assertRevert(error);
    }
  });

  it('should throw an error trying to transfer while transactions are paused', async function() {
    await token.pause();
    try {
      await token.transfer(accounts[1], 100);
      assert.fail('should have thrown before');
    } catch (error) {
      assertRevert(error);
    }
  });

  it('should throw an error trying to transfer from another account while transactions are paused', async function() {
    await token.pause();
    try {
      await token.transferFrom(accounts[0], accounts[1], 100);
      assert.fail('should have thrown before');
    } catch (error) {
      assertRevert(error);
    }
  });
})


contract('SvdToken is burnable', function (accounts) {
    let token
    let expectedTokenSupply = new BigNumber(99)

    beforeEach(async function() {
      token = await SvdToken.new();
      await token.mint(accounts[0], 100);
      await token.finishMinting();
    });

    it('owner should be able to burn tokens', async function () {
      const { logs } = await token.burn(1, { from: accounts[0] })

      const balance = await token.balanceOf(accounts[0])
      balance.should.be.bignumber.equal(expectedTokenSupply)

      const totalSupply = await token.totalSupply()
      totalSupply.should.be.bignumber.equal(expectedTokenSupply)

      const event = logs.find(e => e.event === 'Burn')
      expect(event).to.exist
    })

    it('cannot burn more tokens than your balance', async function () {
      await token.burn(2000, { from: accounts[0] })
        .should.be.rejectedWith(EVMRevert)
    })
})
