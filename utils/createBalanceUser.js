const createBalanceUser = (user) => {
  return {
    userId: user._id,
    wallet: user.wallet,
    balance: user.balance,
  };
};

module.exports = createBalanceUser;
