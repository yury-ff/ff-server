const Balance = require("../models/Balance");
const User = require("../models/User");
require("dotenv").config({ path: "../.env" });

const ethers = require("ethers");
const BankABI = require("../contracts/ForkedFinance.json");

// import USDCABI from "../assets/USDCABI.json";

const bankAddress = process.env.BANK_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(
  `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
);

async function updateBalanceOnDeposit(wallet, value) {
  const balance = await Balance.findOne({ wallet: wallet });
  const user = await User.findOne({ wallet: wallet });
  console.log("updating balance");
  if (!balance) {
    const newBalance = {
      wallet: wallet,
      balance: parseInt(value),
    };
    await Balance.create(newBalance);
  }
  if (balance) {
    balance.balance = balance.balance + parseInt(value);
    await balance.save();
    if (user) {
      user.balance = user.balance + parseInt(value);
      await user.save();
    }
    if (!user) {
      return;
    }
  }
}
async function updateBalanceOnWithdrawal(wallet, value) {
  const balance = await Balance.findOne({ wallet: wallet });
  const user = await User.findOne({ wallet: wallet });

  balance.balance = balance.balance - parseInt(value);
  user.balance = user.balance - parseInt(value);
  await balance.save();
  await user.save();
}

const transactionTracker = async () => {
  console.log("listening for deposits and withdrawals");
  const contract = new ethers.Contract(bankAddress, BankABI, provider);
  console.log(!contract);
  contract.on("Deposit", (address, value) => {
    let info = {
      address: address,
      value: value,
    };
    console.log("deposit recieved");
    const amount = JSON.parse(info.value, null, 2);
    const wallet = info.address;

    updateBalanceOnDeposit(wallet, amount);
  });

  contract.on("Withdrawal", (address, value) => {
    let info = {
      address: address,
      value: value,
    };

    const amount = JSON.parse(info.value, null, 2);
    const wallet = info.address;

    updateBalanceOnWithdrawal(wallet, amount);
  });
};

module.exports = transactionTracker;
