const Balance = require("../models/Balance");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

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
