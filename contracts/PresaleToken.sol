// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract Ownable is Context {
    address private _owner;
    address private _previousOwner;
    uint256 private _lockTime;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
    * @dev Initializes the contract setting the deployer as the initial owner.
    */
    constructor (address owner_) {
        address msgSender = owner_;
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
    * @dev Returns the address of the current owner.
    */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }


    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    function geUnlockTime() public view returns (uint256) {
        return _lockTime;
    }

    //Locks the contract for owner for the amount of time provided
    function lock(uint256 time) public virtual onlyOwner {
        _previousOwner = _owner;
        _owner = address(0);
        _lockTime = block.timestamp + time;
        emit OwnershipTransferred(_owner, address(0));
    }
    
    //Unlocks the contract for owner when _lockTime is exceeds
    function unlock() public virtual {
        require(_previousOwner == msg.sender, "You don't have permission to unlock");
        require(block.timestamp > _lockTime , "Contract is locked until 7 days");
        emit OwnershipTransferred(_owner, _previousOwner);
        _owner = _previousOwner;
    }
}

contract PresaleToken is Ownable {
    using SafeMath for uint;
    address public immutable tokenAddress;
    mapping(address => uint) public balanceOf;
    mapping(address => uint) public investmentOf;
    IERC20 private _tokenContract;
    uint public presaleRate;
    mapping(address => bool) private whitelist;

    struct Config {
        uint startTime;
        uint presaleDays;
        uint lockDays;
        uint softCap;
        uint hardCap;
        uint minContribution;
        uint maxContribution;
        bool whitelistOnly;
    }

    Config private _config;

    event Invested(address investor, uint weiAmount, uint tokenAmount);
    event Withdraw(address investor, uint tokenAmount);

    constructor(address tokenAddress_, address owner_, uint rate_, Config memory config_) Ownable(owner_) {
        tokenAddress = tokenAddress_;
        _tokenContract = IERC20(tokenAddress_);
        _config = config_;
        presaleRate = rate_;
    }

    modifier hasNotExpired() {
        require(getDeadline() >= block.timestamp, "IDO: Expired");
        _;
    }

    modifier withinContribution() {
        if (_config.minContribution != 0)
            require(msg.value >= _config.minContribution, "IDO: Min contribuition not met.");
        if (_config.maxContribution != 0)
            require(msg.value <= _config.maxContribution, "IDO: Max contribuition exceeded.");
        _;
    }

    modifier withinHardCap() {
        require(investmentOf[_msgSender()] + msg.value <= _config.hardCap, "IDO: Hard Cap exceeded.");
        _;
    }

    modifier notLocked() {
        require(getDeadline() + _config.lockDays * 60 * 60 * 24 >= block.timestamp, "IDO: Withdraw is locked.");
        _;
    }

    modifier whitelistedOnly() {
        if (_config.whitelistOnly)
            require(whitelist[_msgSender()], "IDO: Not whitelisted");
        _;
    }

    function getDeadline() public view returns (uint) {
        return _config.startTime + _config.presaleDays * 60 * 60 * 24;
    }

    function getTokenBalance() private view returns (uint) {
        return _tokenContract.balanceOf(address(this));
    }

    function config() public view returns (Config memory) {
        return _config;
    }

    receive() external payable hasNotExpired() withinContribution() withinHardCap() whitelistedOnly() {
        uint tokenToAdd = presaleRate.mul(msg.value).div(1 ether);
        require(getTokenBalance() >= tokenToAdd, "IDO: Not enough token deposited");
        balanceOf[_msgSender()] += tokenToAdd;
        investmentOf[_msgSender()] += msg.value;
        emit Invested(_msgSender(), msg.value, tokenToAdd);
        payable(owner()).transfer(msg.value);
    }

    function withdraw() external notLocked() whitelistedOnly() {
        balanceOf[_msgSender()] = 0;
        _tokenContract.transfer(_msgSender(), balanceOf[_msgSender()]);
        emit Withdraw(_msgSender(), balanceOf[_msgSender()]);
    }
}