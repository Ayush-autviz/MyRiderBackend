const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  editUserProfile,
} = require("../controllers/UserProfile");
const authUser = require("../middlewares/UserAuthentication");
const upload = require("../middlewares/Upload");

// Get user profile
router.get("/", authUser, getUserProfile);

// Edit user profile
router.put("/edit", upload.single("profileImage"), authUser, editUserProfile);

module.exports = router;
