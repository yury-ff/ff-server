const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  from: {
    type: String,
  },
  to: {
    type: Number,
  },
  amount: {
    type: String,
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
