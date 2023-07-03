const Balance = require("../models/Balance");
const User = require("../models/User");
const axios = require("axios");
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

const depositTracker = async () => {
  // await connectDB(
  //   "mongodb+srv://yury:1234@cluster0.mmkktjc.mongodb.net/1?retryWrites=true&w=majority"
  // );

  const contract = new ethers.Contract(bankAddress, BankABI, provider);
  contract.on("Deposit", (address, value) => {
    let info = {
      address: address,
      value: value,
    };

    const amount = JSON.parse(info.value, null, 2);
    const wallet = info.address;
    console.log("Listen for deps");
    updateBalanceOnDeposit(wallet, amount);
  });
};

const withdrawalTracker = async () => {
  // await connectDB(
  //   "mongodb+srv://yury:1234@cluster0.mmkktjc.mongodb.net/1?retryWrites=true&w=majority"
  // );

  const contract = new ethers.Contract(bankAddress, BankABI, provider);
  contract.on("Withdrawal", (address, value) => {
    let info = {
      address: address,
      value: value,
    };
    // value: ethers.utils.formatUnits(value, 2)
    const amount = JSON.parse(info.value, null, 2);
    const wallet = info.address;
    console.log("Listen for withs");

    updateBalanceOnWithdrawal(wallet, amount);
  });
};

depositTracker();
withdrawalTracker();
// updateBalanceOnDeposit("0x2bdF0Cb47D8C06488022852E9048eF1f7eEf9f2c", 1);

module.exports = { depositTracker, withdrawalTracker };
