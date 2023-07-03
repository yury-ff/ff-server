const Balance = require("../models/Balance");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const { ethers } = require("ethers"); // enter your own connection URL
const BankABI = require("../contracts/BankABI.json");
const bankAddress = "0x6299A2eB495480335DF53F3DDbB58539657a807A";

const getAllBalances = async (req, res) => {
  const balances = await Balance.find({})
    .select("-__v")
    .select("-_id")
    .select("-userId");

  res.status(StatusCodes.OK).json(balances);
};

const getBalance = async (req, res) => {
  const {
    params: { wallet: wallet },
  } = req;
  const balance = await Balance.findOne({ wallet: wallet })
    .select("-__v")
    .select("-_id")
    .select("-userId");

  res.status(StatusCodes.OK).json(balance.balance);
};

module.exports = { getAllBalances, getBalance };
