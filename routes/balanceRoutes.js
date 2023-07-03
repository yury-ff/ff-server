const express = require("express");
const router = express.Router();

const {
  getAllBalances,
  getBalance,
  // updateBalanceOnDeposit,
} = require("../controllers/balanceController");

router.route("/").get(getAllBalances);
router.route("/:wallet").get(getBalance);
// router.route("/balanceUpdate").post(updateBalanceOnDeposit);

module.exports = router;
