pragma solidity 0.4.18;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title FxRates
 * @dev Store the historic fx rates for conversion ETHEUR and BTCEUR
 */
contract FxRates is Ownable {
    using SafeMath for uint256;

    struct Rate {
        string rate;
        string timestamp;
    }

    /**
     * @dev Event for logging an update of the exchange rates
     * @param symbol one of ["ETH", "BTC"]
     * @param updateNumber an incremental number giving the number of update
     * @param timestamp human readable timestamp of the earliest validity time
     * @param rate a string containing the rate value
     */
    event LogRateUpdate(string symbol, uint256 updateNumber, string timestamp, string rate);

    uint256 public numberBtcUpdates = 0;

    mapping(uint256 => Rate) public btcUpdates;

    uint256 public numberEthUpdates = 0;

    mapping(uint256 => Rate) public ethUpdates;

    /**
     * @dev Adds the latest Ether Euro rate to the history. Only the crontract owner can execute this.
     * @param _rate the exchange rate
     * @param _timestamp human readable earliest point in time where the rate is valid
     */
    function updateEthRate(string _rate, string _timestamp) public onlyOwner {
        numberEthUpdates = numberEthUpdates.add(1);
        ethUpdates[numberEthUpdates] = Rate({
            rate: _rate,
            timestamp: _timestamp
        });
        LogRateUpdate("ETH", numberEthUpdates, _timestamp, _rate);
    }

    /**
     * @dev Adds the latest Btc Euro rate to the history. . Only the crontract owner can execute this.
     * @param _rate the exchange rate
     * @param _timestamp human readable earliest point in time where the rate is valid
     */
    function updateBtcRate(string _rate, string _timestamp) public onlyOwner {
        numberBtcUpdates = numberBtcUpdates.add(1);
        btcUpdates[numberBtcUpdates] = Rate({
            rate: _rate,
            timestamp: _timestamp
        });
        LogRateUpdate("BTC", numberBtcUpdates, _timestamp, _rate);
    }

    /**
     * @dev Gets the latest Eth Euro rate
     * @return a tuple containing the rate and the timestamp in human readable format
     */
    function getEthRate() public view returns(string, string) {
        return (
            ethUpdates[numberEthUpdates].rate,
            ethUpdates[numberEthUpdates].timestamp
        );
    }

    /**
     * @dev Gets the latest Btc Euro rate
     * @return a tuple containing the rate and the timestamp in human readable format
     */
    function getBtcRate() public view returns(string, string) {
        return (
            btcUpdates[numberBtcUpdates].rate,
            btcUpdates[numberBtcUpdates].timestamp
        );
    }

    /**
     * @dev Gets the historic Eth Euro rate
     * @param _updateNumber the number of the update the rate corresponds to.
     * @return a tuple containing the rate and the timestamp in human readable format
     */
    function getHistEthRate(uint256 _updateNumber) public view returns(string, string) {
        require(_updateNumber <= numberEthUpdates);
        return (
            ethUpdates[_updateNumber].rate,
            ethUpdates[_updateNumber].timestamp
        );
    }

    /**
     * @dev Gets the historic Btc Euro rate
     * @param _updateNumber the number of the update the rate corresponds to.
     * @return a tuple containing the rate and the timestamp in human readable format
     */
    function getHistBtcRate(uint256 _updateNumber) public view returns(string, string) {
        require(_updateNumber <= numberBtcUpdates);
        return (
            btcUpdates[_updateNumber].rate,
            btcUpdates[_updateNumber].timestamp
        );
    }
}
