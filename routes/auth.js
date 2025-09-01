const express = require("express");
const router = express.Router();

const { verifyOtp, auth, refreshToken, register, deleteUserAccount } = require("../controllers/UserAuth");


router.post("/refresh-token", refreshToken);
router.post("/signin", auth);
router.post("/verifyOTP",verifyOtp)
router.post("/register",register)
router.post("/delete-account", deleteUserAccount)

module.exports = router;
