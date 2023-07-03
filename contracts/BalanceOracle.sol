// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "./Ownable.sol";
import "./BankContract.sol";

contract BalanceOracle is Ownable {
    uint private randNonce = 0;
    uint private modulus = 1000;
    uint public gasEthReceived;

    mapping(uint => bool) public pendingRequests;

    event UpdateUserBalanceEvent(address callerAddress, uint id, uint amount);
    event SetUserBalanceEvent(
        uint _userBalance,
        address _callerAddress,
        uint _amount
    );

    function updateUserBalance(
        address userAddress,
        uint amount
    ) external returns (uint) {
        randNonce++;
        uint id = uint(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))
        ) % modulus;
        pendingRequests[id] = true;
        emit UpdateUserBalanceEvent(userAddress, id, amount);
        return id;
    }

    function setUserBalance(
        uint _userBalance,
        address _userAddress,
        address _callerAddress,
        uint _id,
        uint _amount
    ) public onlyOwner {
        require(
            pendingRequests[_id],
            "This request is not in my pending list."
        );
        delete pendingRequests[_id];
        BankContract bankContract = BankContract(_callerAddress);
        bankContract.callback(_userAddress, _userBalance, _id, _amount);
        emit SetUserBalanceEvent(_userBalance, _userAddress, _amount);
    }

    function depositGasEth() public payable {
        gasEthReceived += msg.value;
    }

    function withdrawGasEth() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
