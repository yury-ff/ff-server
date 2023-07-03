//SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "./IERC20.sol";
import "./Ownable.sol";
import "./BalanceOracle.sol";

contract BankContract is Ownable {
    IERC20 public usdcToken =
        IERC20(0x55d030B2A681605b7a1E32d8D924EE124e9D01b7);
    BalanceOracle public oracleInstance;

    uint256 private balance;
    address private oracleAddress;
    address private bank = address(this);
    address private Owner = msg.sender;

    uint public preBpsFee = 50;
    uint public bps = 10000;
    uint public totalFee;

    mapping(uint256 => bool) myRequests;
    mapping(address => uint) private transactionsVolume;
    mapping(address => uint) public userBalances;

    event newOracleAddress(address oracleAddress);
    event ReceivedNewRequestId(
        uint id,
        address userAddress,
        uint amountToWithdraw
    );
    event BalanceUpdated(address _userAddress, uint balance, uint id);
    event Deposit(address, uint userBalance);
    event Withdrawal(address, uint amountToWithdraw);

    function setOracleInstanceAddress(
        address _oracleInstanceAddress
    ) public onlyOwner {
        oracleAddress = _oracleInstanceAddress;
        BalanceOracle balanceOracle = BalanceOracle(oracleAddress);
        oracleInstance = balanceOracle;
        emit newOracleAddress(oracleAddress);
    }

    function updateUserBalance(address userAddress, uint amount) internal {
        uint id = oracleInstance.updateUserBalance(userAddress, amount);
        uint amountToWithdraw = amount;
        myRequests[id] = true;
        emit ReceivedNewRequestId(id, userAddress, amountToWithdraw);
    }

    function callback(
        address _userAddress,
        uint _userBalance,
        uint _id,
        uint _amount
    ) external onlyOracle {
        require(myRequests[_id], "This request is not in my pending list.");
        userBalances[_userAddress] = _userBalance;
        withdrawUSDC(_userAddress, _amount);
        delete myRequests[_id];
        emit BalanceUpdated(_userAddress, _userBalance, _id);
    }

    modifier onlyOracle() {
        require(
            msg.sender == oracleAddress,
            "You are not authorized to call this function."
        );
        _;
    }

    function depositUSDC(uint amount) public {
        uint commission;
        uint depositedAmount;
        uint transactionVolume;

        usdcToken.transferFrom(msg.sender, bank, amount);
        usdcToken.transfer(Owner, ((amount * preBpsFee) / bps));
        commission = ((amount * preBpsFee) / bps);

        depositedAmount = amount - commission;
        userBalances[msg.sender] = userBalances[msg.sender] + depositedAmount;
        totalFee = totalFee + commission;

        transactionVolume = amount;
        transactionsVolume[msg.sender] =
            transactionsVolume[msg.sender] +
            transactionVolume;

        emit Deposit(msg.sender, depositedAmount);
    }

    //reentrency attack

    function initiateWithdraw(uint amount) public {
        address userAddress = msg.sender;
        updateUserBalance(userAddress, amount);
    }

    function withdrawUSDC(address userAddress, uint amount) public onlyOracle {
        uint commission;
        uint userBalance;
        uint transactionVolume;
        uint withdrawnAmount;

        require(
            userBalances[userAddress] >= amount,
            "Amount exceeds your balance"
        );
        userBalance = userBalances[userAddress] - amount;
        userBalances[userAddress] = userBalance;

        commission = ((amount * preBpsFee) / bps);
        withdrawnAmount = amount - commission;
        usdcToken.transfer(userAddress, withdrawnAmount);
        usdcToken.transfer(Owner, commission);
        totalFee = totalFee + commission;

        transactionVolume = amount;
        transactionsVolume[userAddress] =
            transactionsVolume[userAddress] +
            transactionVolume;

        emit Withdrawal(userAddress, withdrawnAmount);
    }

    function getBalance() public view returns (uint) {
        return userBalances[msg.sender];
    }

    function totalRevenue() public view onlyOwner returns (uint) {
        return totalFee;
    }
}
