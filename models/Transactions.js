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
  date: {
    type: Date,
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
