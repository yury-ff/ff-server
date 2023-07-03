const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  transferUserBalance,
  updateBalance,
  updateUserBalanceDeposit,
  updateUserBalanceWithdrawal,
  updateUserWallet,
  validateUserTo,
} = require("../controllers/userController");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateBalance").get(authenticateUser, updateBalance);
router.route("/validateUserTo").post(authenticateUser, validateUserTo);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/updateUserWallet").patch(authenticateUser, updateUserWallet);
router
  .route("/updateUserBalanceDeposit")
  .patch(authenticateUser, updateUserBalanceDeposit);
router
  .route("/updateUserBalanceWithdrawal")
  .patch(authenticateUser, updateUserBalanceWithdrawal);
router
  .route("/transferUserBalance")
  .patch(authenticateUser, transferUserBalance);

router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
