pragma solidity 0.4.18;

import "../node_modules/zeppelin-solidity/contracts/token/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title SvdToken
 * @dev Savedroid's ERC20 Token.
 * Besides the standard ERC20 functionality, the token allows minting, batch minting and burning.
 * The contract is also pausable, impacting transfer/approve and burning functionalities.
 *
 * This contract is heavily based on the Open Zeppelin contracts: Pausable, MintableToken.
 */
contract SvdToken is MintableToken, Pausable {
    using SafeMath for uint256;

    event Burn(address indexed burner, uint256 value);

    string public constant NAME = "savedroid";
    string public constant SYMBOL = "SVD";
    uint8 public constant DECIMALS = 18;

    uint256 public constant CAP = 10000000000000000000000000000;

    /**
     * @dev Function to batch mint tokens
     * @param _to An array of addresses that will receive the minted tokens.
     * @param _amount An array with the amounts of tokens each address will get minted.
     * @return A boolean that indicates whether the operation was successful.
     */
    function batchMint(address[] _to, uint256[] _amount) external
    canMint
    returns (bool) {
        require(_to.length == _amount.length);
        for (uint i = 0; i < _to.length; i++) {
            require(mint(_to[i], _amount[i]));
        }
        return true;
    }

    /**
    * @dev transfer token for a specified address when the contract is not paused.
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public
    whenNotPaused
    returns (bool) {
        return super.transfer(_to, _value);
    }

    /**
     * @dev Transfer tokens from one address to another when the contract is not paused.
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address _from, address _to, uint256 _value) public
    whenNotPaused
    returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on
     * behalf of msg.sender when the contract is not paused.
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public
    whenNotPaused
    returns (bool) {
        return super.approve(_spender, _value);
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender
     * when the contract is not paused.
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(address _spender, uint _addedValue) public
    whenNotPaused
    returns (bool success) {
        return super.increaseApproval(_spender, _addedValue);
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender
     * when the contract is not paused.
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(address _spender, uint _subtractedValue) public
    whenNotPaused
    returns (bool success) {
        return super.decreaseApproval(_spender, _subtractedValue);
    }

    /**
     * @dev Function to mint tokens. Controls that the CAP will be maintained
     * after minting and then calls the MintableToken's function
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _to, uint256 _amount) public
    canMint
    returns (bool) {
        require(_amount > 0);
        require(totalSupply.add(_amount) <= CAP);
        return super.mint(_to, _amount);
    }

    /**
     * @dev Burns a specific amount of tokens.
     * @param _value The amount of token to be burned.
     */
    function burn(uint256 _value) public
    whenNotPaused
    {
        require(_value > 0);
        require(_value <= balances[msg.sender]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        address burner = msg.sender;
        balances[burner] = balances[burner].sub(_value);
        totalSupply = totalSupply.sub(_value);
        Burn(burner, _value);
    }


}
