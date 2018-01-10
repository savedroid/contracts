Savedroid ICO Smart Contracts
========================

### Audit

https://medium.com/@s_ho/57c87378a977 from Sebastian Hoffmann

### Preparations

Install dependencies:
```
npm i
npm install -g truffle
```

### Further Preparations for Rinkeby

To run geth on the Rinkeby testnet, enter the geth console:
```
geth --rinkeby --fast --rpc console
```

To create an account on the Rinkeby testnet, enter:
```
personal.newAccount()
```

Enter a passphrase, repeat it and remember it. Your new address will be displayed.
Unlock your new account:
```
personal.unlockAccount("0x...")
```

Copy the account and paste it into the truffle.js file in the "from" field. Transfer some funds on the Rinkeby testnet to the new address.

### Deploy

Open a new Terminal. First, compile the contract:
```
truffle compile
```

To deploy the smart contract on the development network, run:
```
truffle migrate --network development
```

To deploy the smart contract on the Rinkeby testnet, run:
```
truffle migrate --network rinkeby
```

**Be careful!** Every deploy on the same network replaces metadata (including the contract address) stored in the `build` directory.


### Minting

In order to mint the tokens, the token contract is required (which is as of January 10th not yet the case).
To mint tokens, prepare a JSON file `distribution.json`. For example:
```json
{
  "0x8A6d9138e960577D230Ba5F86f872418EA8c0506": {
    "amount": 1.23,
  },
  "0xf6d1fa4fd83ba3e0c77642756e95917b8a47c1dd": {
    "amount": 0.000000000000000001,
  }
}
```

Then run (on the development network):
```
truffle exec scripts/mint.js --network development
```

Or on the Rinkeby testnet:
```
truffle exec scripts/mint.js --network rinkeby
```



### Running tests

Run testrpc:
```
testrpc
```

While testrpc is running, run tests:
```
truffle test
```

*Due to use of testrpc’s `evm_increaseTime`, you should restart testrpc after each run of tests.*


## Rinkeby testnet setup

1. Install geth: https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum
1. Run it on the Rinkeby testnet:
    ```
    geth --rinkeby --rpc
    ```
1. Find in the beginning of the geth log a line like this one:
    ```
    IPC endpoint opened: <path_to_ipc>/geth.ipc
    ```
1. Open another terminal and run (using the file path from the previous step):
    ```
    geth attach <path_to_ipc>/geth.ipc
    ```
1. Wait for the blockchain to sync. In the geth log, it looks like:
    ```
    ... Imported new chain segment               blocks=1 ...
    ```
    Also you can run `eth.syncing` in the geth console. It should return `false` instead of sync information.
1. We need to create an account. In the geth console, run:
    ```
    personal.newAccount()
    ```
    When it prompts for a passphrase, input a strong one (32 random chars, for example). Of course, you have to store it somewhere.
1. Now restart geth with the unlock parameter:
    ```
    geth --rinkeby --rpc --unlock "0x0000000000000000000000000000000000000000"
    ```
    Instead of `0x0000000000000000000000000000000000000000`, use account you created in the previous step. While starting, geth will prompt you for the passphrase.
1. Transfer some ETH to account to pay for gas.
