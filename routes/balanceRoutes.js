const express = require("express");
const router = express.Router();

const {
  getAllBalances,
  getBalance,
} = require("../controllers/balanceController");

router.route("/").get(getAllBalances);
router.route("/:wallet").get(getBalance);

module.exports = router;
