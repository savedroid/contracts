pragma solidity 0.4.18;


import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";


/**
 * @title SvdPreSale
 * @dev This crowdsale contract filters investments made according to
 *         - time
 *         - amount invested (in Wei)
 *         - whitelist of addresses
 *      and forwards them to a predefined wallet in case all the pre conditions are met.
 */
contract SvdPreSale is Pausable {
    using SafeMath for uint256;

    // start and end timestamps where investments are allowed (both inclusive)
    uint256 public startTime;
    uint256 public endTime;

    // address where funds are collected
    address public wallet;

    // address allowed to add and remove addresses from whitelisting
    address public whitelister;

    // track the investments made from each address
    mapping(address => uint256) public investments;

    // total amount of funds raised (in wei)
    uint256 public weiRaised;

    uint256 public minWeiWhitelistInvestment;

    uint256 public minWeiInvestment;
    uint256 public maxWeiInvestment;

    mapping (address => bool) public investorWhitelist;

    /**
     * @dev Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     */
    event LogInvestment(address indexed purchaser,
        address indexed beneficiary,
        uint256 value);

    /**
     * @dev Event for whitelisting / de-whitelisting an address
     * @param investor the address that was whitelisted
     * @param status the status value, true if it is whitelisted, false otherwise
     */
    event LogWhitelisted(address investor, bool status);

    /**
     * @dev Constructor
     * @param _startTime the time to begin the crowdsale in seconds since the epoch
     * @param _endTime the time to begin the crowdsale in seconds since the epoch. Must be later than _startTime.
     * @param _minWeiInvestment the minimum amount for one single investment (in Wei)
     * @param _maxWeiInvestment the maximum amount for one single investment (in Wei)
     * @param _minWeiWhitelistInvestment investments equal/greater than this must have the benificiary whitelisted
     * @param _whitelister the address of the account allowed to add and remove from whitelist
     * @param _wallet the address to which funds will be directed to
     */
    function SvdPreSale(uint256 _startTime,
        uint256 _endTime,
        uint256 _minWeiInvestment,
        uint256 _maxWeiInvestment,
        uint256 _minWeiWhitelistInvestment,
        address _whitelister,
        address _wallet) public {
        /* require(_startTime >= now); */
        require(_endTime > _startTime);
        require(_minWeiInvestment > 0);
        require(_maxWeiInvestment > _minWeiInvestment);
        require(_wallet != address(0));

        startTime = _startTime;
        endTime = _endTime;

        whitelister = _whitelister;

        minWeiInvestment = _minWeiInvestment;
        maxWeiInvestment = _maxWeiInvestment;
        minWeiWhitelistInvestment = _minWeiWhitelistInvestment;

        wallet = _wallet;
    }

    /**
     * @dev External payable function to receive funds and buy tokens.
     */
    function () external payable {
        buyTokens(msg.sender);
    }

    /**
     * @dev Low level token purchase function
     */
    function buyTokens(address beneficiary) public whenNotPaused payable {
        require(beneficiary != address(0));
        require(validPurchase());

        uint256 weiAmount = msg.value;

        if (weiAmount >= minWeiWhitelistInvestment) {
            require(investorWhitelist[beneficiary]);
        }

        // track how much wei is raised in total
        weiRaised = weiRaised.add(weiAmount);

        // track how much was transfered by the specific investor
        investments[beneficiary] = investments[beneficiary].add(weiAmount);

        LogInvestment(msg.sender, beneficiary, weiAmount);

        forwardFunds();
    }

    /**
     * @dev Adapted Crowdsale#hasEnded
     * @return true if crowdsale event has started
     */
    function hasStarted() public view returns (bool) {
        return now >= startTime;
    }

    /**
     * @dev Adapted Crowdsale#hasEnded
     * @return true if crowdsale event has ended
     */
    function hasEnded() public view returns (bool) {
        return now > endTime;
    }

    /**
     * @dev Allow addresses to do early participation.
     * @param addr the address to be (de)whitelisted
     * @param status the status value, true if it is whitelisted, false otherwise
     */
    function setInvestorWhitelist(address addr, bool status) public {
        require(msg.sender == whitelister);
        investorWhitelist[addr] = status;
        LogWhitelisted(addr, status);
    }

    // send ether (wei) to the fund collection wallet
    // override to create custom fund forwarding mechanisms
    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    // overriding Crowdsale#validPurchase to add extra cap logic
    // @return true if investors can buy at the moment
    function validPurchase() internal view returns (bool) {
        if (msg.value < minWeiInvestment || msg.value > maxWeiInvestment) {
            return false;
        }
        bool withinPeriod = now >= startTime && now <= endTime;
        bool nonZeroPurchase = msg.value != 0;
        return withinPeriod && nonZeroPurchase;
    }

}
