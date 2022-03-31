import { parseEther } from "@ethersproject/units";
import { ChainId } from "@usedapp/core";
import { PRESALE_DEPLOY_CHARGE } from "../constants/system";
import { ITokenPresaleProps } from "../interfaces/ITokenPresaleProps";

import solc from "solc";
import { CompileError } from "../interfaces/solidity/CompileError";

export function getContractFile(
  name: string,
  source: string
): undefined | ContractFile {
  const input = {
    language: "Solidity",
    sources: {
      [name + ".sol"]: {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };
  const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
  console.log(tempFile);

  const contractFile = tempFile?.contracts?.[name + ".sol"]?.[name];
  const errorsAndWarnings: CompileError[] = tempFile?.errors
    ? tempFile.errors
    : [];
  const errors = errorsAndWarnings.filter((e) => e.severity === "error");
  if (!contractFile || errors.length > 0) throw tempFile.errors;
  return contractFile;
}

export function getPresaleContractCode(
  chainId: ChainId,
  config: ITokenPresaleProps
) {
  return `
  // SPDX-License-Identifier: MIT

  pragma solidity ^0.8.0;

  /**
   * @dev Interface of the ERC20 standard as defined in the EIP.
   */
  interface IERC20 {
      /**
       * @dev Returns the amount of tokens in existence.
       */
      function totalSupply() external view returns (uint256);

      /**
       * @dev Returns the amount of tokens owned by 'account'.
       */
      function balanceOf(address account) external view returns (uint256);

      /**
       * @dev Moves 'amount' tokens from the caller's account to 'recipient'.
       *
       * Returns a boolean value indicating whether the operation succeeded.
       *
       * Emits a {Transfer} event.
       */
      function transfer(address recipient, uint256 amount) external returns (bool);

      /**
       * @dev Returns the remaining number of tokens that 'spender' will be
       * allowed to spend on behalf of 'owner' through {transferFrom}. This is
       * zero by default.
       *
       * This value changes when {approve} or {transferFrom} are called.
       */
      function allowance(address owner, address spender) external view returns (uint256);

      /**
       * @dev Sets 'amount' as the allowance of 'spender' over the caller's tokens.
       *
       * Returns a boolean value indicating whether the operation succeeded.
       *
       * IMPORTANT: Beware that changing an allowance with this method brings the risk
       * that someone may use both the old and the new allowance by unfortunate
       * transaction ordering. One possible solution to mitigate this race
       * condition is to first reduce the spender's allowance to 0 and set the
       * desired value afterwards:
       * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
       *
       * Emits an {Approval} event.
       */
      function approve(address spender, uint256 amount) external returns (bool);

      /**
       * @dev Moves 'amount' tokens from 'sender' to 'recipient' using the
       * allowance mechanism. 'amount' is then deducted from the caller's
       * allowance.
       *
       * Returns a boolean value indicating whether the operation succeeded.
       *
       * Emits a {Transfer} event.
       */
      function transferFrom(
          address sender,
          address recipient,
          uint256 amount
      ) external returns (bool);

      /**
       * @dev Emitted when 'value' tokens are moved from one account ('from') to
       * another ('to').
       *
       * Note that 'value' may be zero.
       */
      event Transfer(address indexed from, address indexed to, uint256 value);

      /**
       * @dev Emitted when the allowance of a 'spender' for an 'owner' is set by
       * a call to {approve}. 'value' is the new allowance.
       */
      event Approval(address indexed owner, address indexed spender, uint256 value);
  }

  /**
   * @dev Provides information about the current execution context, including the
   * sender of the transaction and its data. While these are generally available
   * via msg.sender and msg.data, they should not be accessed in such a direct
   * manner, since when dealing with meta-transactions the account sending and
   * paying for execution may not be the actual sender (as far as an application
   * is concerned).
   *
   * This contract is only required for intermediate, library-like contracts.
   */
  abstract contract Context {
      function _msgSender() internal view virtual returns (address) {
          return msg.sender;
      }

      function _msgData() internal view virtual returns (bytes calldata) {
          return msg.data;
      }
  }

  // CAUTION
  // This version of SafeMath should only be used with Solidity 0.8 or later,
  // because it relies on the compiler's built in overflow checks.

  /**
   * @dev Wrappers over Solidity's arithmetic operations.
   *
   * NOTE: 'SafeMath' is no longer needed starting with Solidity 0.8. The compiler
   * now has built in overflow checking.
   */
  library SafeMath {
      /**
       * @dev Returns the addition of two unsigned integers, with an overflow flag.
       *
       * _Available since v3.4._
       */
      function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
          unchecked {
              uint256 c = a + b;
              if (c < a) return (false, 0);
              return (true, c);
          }
      }

      /**
       * @dev Returns the substraction of two unsigned integers, with an overflow flag.
       *
       * _Available since v3.4._
       */
      function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
          unchecked {
              if (b > a) return (false, 0);
              return (true, a - b);
          }
      }

      /**
       * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
       *
       * _Available since v3.4._
       */
      function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
          unchecked {
              // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
              // benefit is lost if 'b' is also tested.
              // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
              if (a == 0) return (true, 0);
              uint256 c = a * b;
              if (c / a != b) return (false, 0);
              return (true, c);
          }
      }

      /**
       * @dev Returns the division of two unsigned integers, with a division by zero flag.
       *
       * _Available since v3.4._
       */
      function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
          unchecked {
              if (b == 0) return (false, 0);
              return (true, a / b);
          }
      }

      /**
       * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
       *
       * _Available since v3.4._
       */
      function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
          unchecked {
              if (b == 0) return (false, 0);
              return (true, a % b);
          }
      }

      /**
       * @dev Returns the addition of two unsigned integers, reverting on
       * overflow.
       *
       * Counterpart to Solidity's '+' operator.
       *
       * Requirements:
       *
       * - Addition cannot overflow.
       */
      function add(uint256 a, uint256 b) internal pure returns (uint256) {
          return a + b;
      }

      /**
       * @dev Returns the subtraction of two unsigned integers, reverting on
       * overflow (when the result is negative).
       *
       * Counterpart to Solidity's '-' operator.
       *
       * Requirements:
       *
       * - Subtraction cannot overflow.
       */
      function sub(uint256 a, uint256 b) internal pure returns (uint256) {
          return a - b;
      }

      /**
       * @dev Returns the multiplication of two unsigned integers, reverting on
       * overflow.
       *
       * Counterpart to Solidity's '*' operator.
       *
       * Requirements:
       *
       * - Multiplication cannot overflow.
       */
      function mul(uint256 a, uint256 b) internal pure returns (uint256) {
          return a * b;
      }

      /**
       * @dev Returns the integer division of two unsigned integers, reverting on
       * division by zero. The result is rounded towards zero.
       *
       * Counterpart to Solidity's '/' operator.
       *
       * Requirements:
       *
       * - The divisor cannot be zero.
       */
      function div(uint256 a, uint256 b) internal pure returns (uint256) {
          return a / b;
      }

      /**
       * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
       * reverting when dividing by zero.
       *
       * Counterpart to Solidity's '%' operator. This function uses a 'revert'
       * opcode (which leaves remaining gas untouched) while Solidity uses an
       * invalid opcode to revert (consuming all remaining gas).
       *
       * Requirements:
       *
       * - The divisor cannot be zero.
       */
      function mod(uint256 a, uint256 b) internal pure returns (uint256) {
          return a % b;
      }

      /**
       * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
       * overflow (when the result is negative).
       *
       * CAUTION: This function is deprecated because it requires allocating memory for the error
       * message unnecessarily. For custom revert reasons use {trySub}.
       *
       * Counterpart to Solidity's '-' operator.
       *
       * Requirements:
       *
       * - Subtraction cannot overflow.
       */
      function sub(
          uint256 a,
          uint256 b,
          string memory errorMessage
      ) internal pure returns (uint256) {
          unchecked {
              require(b <= a, errorMessage);
              return a - b;
          }
      }

      /**
       * @dev Returns the integer division of two unsigned integers, reverting with custom message on
       * division by zero. The result is rounded towards zero.
       *
       * Counterpart to Solidity's '/' operator. Note: this function uses a
       * 'revert' opcode (which leaves remaining gas untouched) while Solidity
       * uses an invalid opcode to revert (consuming all remaining gas).
       *
       * Requirements:
       *
       * - The divisor cannot be zero.
       */
      function div(
          uint256 a,
          uint256 b,
          string memory errorMessage
      ) internal pure returns (uint256) {
          unchecked {
              require(b > 0, errorMessage);
              return a / b;
          }
      }

      /**
       * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
       * reverting with custom message when dividing by zero.
       *
       * CAUTION: This function is deprecated because it requires allocating memory for the error
       * message unnecessarily. For custom revert reasons use {tryMod}.
       *
       * Counterpart to Solidity's '%' operator. This function uses a 'revert'
       * opcode (which leaves remaining gas untouched) while Solidity uses an
       * invalid opcode to revert (consuming all remaining gas).
       *
       * Requirements:
       *
       * - The divisor cannot be zero.
       */
      function mod(
          uint256 a,
          uint256 b,
          string memory errorMessage
      ) internal pure returns (uint256) {
          unchecked {
              require(b > 0, errorMessage);
              return a % b;
          }
      }
  }

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

  contract TokenPresale is Ownable {
      using SafeMath for uint;
      address public immutable tokenAddress;
      mapping(address => uint) public balanceOf;
      mapping(address => uint) public investmentOf;
      IERC20 private _tokenContract;
      uint public presaleRate;
      mapping(address => bool) private whitelist;
      uint public totalInvestment;

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

      constructor(address tokenAddress_, address owner_, uint presaleRate_, Config memory config_) Ownable(owner_) payable {
          require(msg.value >= ${parseEther(
            PRESALE_DEPLOY_CHARGE[chainId]
          )}, "IDO: Not enough Charge provided.");
          tokenAddress = tokenAddress_;
          _tokenContract = IERC20(tokenAddress_);
          _config = config_;
          presaleRate = presaleRate_;
          totalInvestment = 0;
      }

      modifier hasNotExpired() {
          require(getDeadline() >= block.timestamp, "IDO: Expired");
          _;
      }

      modifier withinContribution() {
          if (_config.minContribution != 0)
              require(msg.value + investmentOf[_msgSender()] >= _config.minContribution, "IDO: Min contribuition not met.");
          if (_config.maxContribution != 0)
              require(msg.value + investmentOf[_msgSender()] <= _config.maxContribution, "IDO: Max contribuition exceeded.");
          _;
      }

      modifier withinHardCap() {
          require(totalInvestment + msg.value <= _config.hardCap, "IDO: Hard Cap exceeded.");
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

      function config() public view returns (Config memory) {
          return _config;
      }

      function getDeadline() public view returns (uint) {
          return _config.startTime + _config.presaleDays * 60 * 60 * 24;
      }

      function getTokenBalance() private view returns (uint) {
          return _tokenContract.balanceOf(address(this));
      }

      receive() external payable hasNotExpired() withinContribution() withinHardCap() whitelistedOnly() {
          uint tokenToAdd = presaleRate.mul(msg.value).div(1 ether);
          require(getTokenBalance() >= tokenToAdd, "IDO: Not enough token deposited");
          balanceOf[_msgSender()] += tokenToAdd;
          investmentOf[_msgSender()] += msg.value;
          totalInvestment += msg.value;
          emit Invested(_msgSender(), msg.value, tokenToAdd);
          payable(owner()).transfer(msg.value);
      }

      function withdraw() external notLocked() whitelistedOnly() {
          balanceOf[_msgSender()] = 0;
          _tokenContract.transfer(_msgSender(), balanceOf[_msgSender()]);
          emit Withdraw(_msgSender(), balanceOf[_msgSender()]);
      }
  }

  `;
}
