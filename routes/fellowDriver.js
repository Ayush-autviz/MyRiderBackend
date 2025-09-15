const express = require("express");
const router = express.Router();

const authDriver = require("../middlewares/DriverAuthentication");
const upload = require("../middlewares/Upload");

const {
  addFellowDriver,
  getFellowDrivers,
  getApprovedFellowDrivers,
  updateFellowDriver,
  deleteFellowDriver,
  findFellowDriverByNumber,
  linkFellowDriverByNumber,
} = require("../controllers/FellowDriver");

// Fellow driver management routes for drivers
router.post(
  "/",
  authDriver,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "drivingLicenseFront", maxCount: 1 },
    { name: "drivingLicenseBack", maxCount: 1 },
  ]),
  addFellowDriver
);

router.get("/", authDriver, getFellowDrivers);
router.get("/approved", authDriver, getApprovedFellowDrivers);
router.get("/lookup", authDriver, findFellowDriverByNumber);

router.put(
  "/:fellowDriverId",
  authDriver,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "drivingLicenseFront", maxCount: 1 },
    { name: "drivingLicenseBack", maxCount: 1 },
  ]),
  updateFellowDriver
);

router.delete("/:fellowDriverId", authDriver, deleteFellowDriver);

// Link existing fellow driver by mobile number to current driver's list
router.post("/link-by-number", authDriver, linkFellowDriverByNumber);

module.exports = router;
