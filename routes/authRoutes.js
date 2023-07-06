const express = require("express");
const router = express.Router();
const cors = require("cors");
const { authenticateUser } = require("../middleware/authentication");
// const cors = require("../middleware/cors")

const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const corsOptions = {
  origin: "https://ff-front-end.onrender.com",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

router.post("/register", register);
router.post("/login", cors(corsOptions), login);
router.delete("/logout", authenticateUser, logout);
router.post("/verify-email", verifyEmail);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

module.exports = router;
