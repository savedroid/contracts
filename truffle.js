require('babel-register');
require('babel-polyfill');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 6712388 // Gas limit used for deploys
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0x009ae1e9fe05a03b4f7bb2facb9e590c5b0fa935", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 5612388 // Gas limit used for deploys
    }

  }

};
