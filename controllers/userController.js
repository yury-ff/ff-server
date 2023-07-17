const User = require("../models/User");
const Balance = require("../models/Balance");
const createBalanceUser = require("../utils/createBalanceUser");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserWallet = async (req, res) => {
  const { wallet } = req.body;

  const user = await User.findOne({ _id: req.user.userId }).select("-password");
  const balance = await Balance.findOne({ wallet: wallet });

  if (user.wallet == "" || !user.wallet) {
    user.wallet = wallet;
    user.balance = balance.balance;
    await user.save();
  }

  if (!balance) {
    const balanceUser = createBalanceUser(user);
    await Balance.create(balanceUser);
    await user.save();
  }

  if (!balance && (user.wallet == "" || !user.wallet)) {
    user.wallet = wallet;
    const balanceUser = createBalanceUser(user);
    await Balance.create(balanceUser);
    await user.save();
  }

  res.status(StatusCodes.OK).json({ msg: "Success! Wallet confirmed." });
};

const updateBalance = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.userId }).select(
      "-password"
    );

    res.status(StatusCodes.OK).json({ balance: user.balance });
  } catch (error) {
    console.log(error);
  }
};

const transferUserBalance = async (req, res) => {
  const { value, email } = req.body;

  if (!value || value == 0) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "No point in sending nothing..." });
    return;
  }
  const convertedValue = value * 10 ** 6;
  const user = await User.findOne({ _id: req.user.userId }).select("-password");
  const balance = await Balance.findOne({ wallet: user.wallet });

  const userTo = await User.findOne({
    $or: [{ name: email }, { email: email }, { wallet: email }],
  }).select("-password");

  if (!userTo) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "No Such User" });
    return;
  }
  if (!balance) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "No balance User" });
    return;
  }

  const balanceUserTo = await Balance.findOne({ wallet: userTo.wallet });

  if (!balanceUserTo) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "No balanceUserTo User" });
    return;
  }
  if (user.balance >= convertedValue) {
    user.balance = user.balance - convertedValue;
    balance.balance = balance.balance - convertedValue;
    userTo.balance = userTo.balance + convertedValue;
    balanceUserTo.balance = balanceUserTo.balance + convertedValue;
    await user.save();
    await balance.save();
    await userTo.save();
    await balanceUserTo.save();
    res.status(StatusCodes.OK).json({ msg: "Success! Transfer confirmed." });
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "Not enough balance" });
  }
};

const validateUserTo = async (req, res) => {
  const credentials = req.body;

  if (!Object.values(credentials)[0]) {
    throw new CustomError.BadRequestError(
      "Please provide Name, Email or Wallet"
    );
  }

  let userTo = await User.findOne({ email: Object.values(credentials)[0] })
    .select("-password")
    .select("-verificationToken")
    .select("-isVerified")
    .select("-verified")
    .select("-__v");

  if (!userTo) {
    userTo = await User.findOne({
      name: Object.values(credentials)[0],
    })
      .select("-password")
      .select("-verificationToken")
      .select("-isVerified")
      .select("-verified")
      .select("-__v");

    if (!userTo) {
      userTo = await User.findOne({
        wallet: Object.values(credentials)[0],
      })
        .select("-password")
        .select("-verificationToken")
        .select("-isVerified")
        .select("-verified")
        .select("-__v");
      if (!userTo) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "No User found" });
      } else {
        res.status(StatusCodes.OK).json({
          email: userTo.email,
          name: userTo.name,
          wallet: userTo.wallet,
        });
      }
    } else {
      res.status(StatusCodes.OK).json({
        email: userTo.email,
        name: userTo.name,
        wallet: userTo.wallet,
      });
    }
  } else {
    res.status(StatusCodes.OK).json({
      email: userTo.email,
      name: userTo.name,
      wallet: userTo.wallet,
    });
  }
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,

  transferUserBalance,
  updateBalance,
  updateUserWallet,
  validateUserTo,
};
