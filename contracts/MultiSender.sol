// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MultiSender is Ownable {
    using SafeMath for uint;
    address payable public receiverWallet;

    event SendToken(address _token, address _from, address _to, uint _amount);
    event SendNative(address _from, address _to, uint _amount);

    constructor(address payable wallet) {
        receiverWallet = wallet;
    }

    function sendToken(address _token, address[] calldata recipients, uint[] calldata amounts) public payable {
        uint total = 0;
        uint charge = 10**16;
        if (recipients.length >= 0 && recipients.length < 100) {
            charge = 10**16;
        }
        else if (recipients.length < 500) {
            charge = 5*10**16;
        }
        else {
            charge = 1*10**16;
        }
        require(recipients.length == amounts.length, "Recipient and Amounts mismatch");
        require(msg.value >= charge, "Not enough charge");
        for (uint i = 0; i < recipients.length; i++) {
            total+=amounts[i];
        }
        uint allowance = IERC20(_token).allowance(msg.sender, address(this));
        require(allowance >= total, "Not enough fund");
        for (uint i = 0; i < recipients.length; i++) {
            IERC20(_token).transferFrom(msg.sender, recipients[i], amounts[i]);
            emit SendToken(_token, msg.sender, recipients[i], amounts[i]);
        }
        receiverWallet.transfer(msg.value);
    }

    function sendNative(address payable[] memory recipients, uint[] memory amounts) public payable {
        uint total = 0;
        uint charge = 10**16;
        if (recipients.length >= 0 && recipients.length < 100) {
            charge = 10**16;
        }
        else if (recipients.length < 500) {
            charge = 5*10**16;
        }
        else {
            charge = 1*10**16;
        }
        require(recipients.length == amounts.length, "Recipient and Amounts mismatch");
        for (uint i = 0; i < recipients.length; i++) {
            total+=amounts[i];
        }
        require(msg.value >= charge + total, "Not enough charge");
        for (uint i = 0; i < recipients.length; i++) {
            recipients[i].transfer(amounts[i]);
            emit SendNative(msg.sender, recipients[i], amounts[i]);
        }
        receiverWallet.transfer(charge);
    }
}

