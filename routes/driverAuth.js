const express = require("express");
const router = express.Router();

const { uploadDriverDocuments } = require("../config/multerConfig");
const authdriver = require("../middlewares/DriverAuthentication");

const {
  registerDriver,
  getDriverDetails,
  editDriverDetails,
  auth,
  submitVehicleDetails,
  uploadDocuments,
  goOnline,
  goOnlineWithExtra,
  goOffline,
  updateDriverStatus,
  editVehicleDetails,
  editDriverDocuments,
  verifyOtp,
} = require("../controllers/DriverAuth");

const upload = require("../middlewares/Upload");
const { getDriverRides } = require("../controllers/Ride");

// Fellow driver routes
const fellowDriverRoutes = require("./fellowDriver");

router.post("/login", auth);
router.post("/register", registerDriver);
router.post("/verifyOTP", verifyOtp);
router.put(
  "/drivers/:driverId/vehicle-details",
  upload.fields([
    { name: "vehicleImage", maxCount: 1 },
    { name: "numberPlateImage", maxCount: 1 },
  ]),
  submitVehicleDetails
);

// Upload documents (multiple files upload)
router.put(
  "/drivers/:driverId/upload-documents",
  upload.fields([
    { name: "drivingLicenseFront", maxCount: 1 },
    { name: "drivingLicenseBack", maxCount: 1 },
    { name: "vehicleRegistration", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  uploadDocuments
);

router.get("/driver/details", authdriver, getDriverDetails);
router.put(
  "/driver/edit-profile",
  upload.single("profilePhoto"),
  authdriver,
  editDriverDetails
);

router.post("/go-online", goOnline);
router.post("/go-online-with-extra", goOnlineWithExtra);
router.post("/go-offline", goOffline);

// Update driver status from ApprovalPending to active
router.put("/drivers/:driverId/update-status", updateDriverStatus);

// Edit vehicle details
router.put(
  "/driver/edit-vehicle",

  upload.fields([
    { name: "vehicleImage", maxCount: 1 },
    { name: "numberPlateImage", maxCount: 1 },
  ]),
  authdriver,
  editVehicleDetails
);

// Edit driver documents
router.put(
  "/driver/edit-documents",

  upload.fields([
    { name: "drivingLicenseFront", maxCount: 1 },
    { name: "drivingLicenseBack", maxCount: 1 },
    { name: "vehicleRegistration", maxCount: 1 },
  ]),
  authdriver,
  editDriverDocuments
);

router.get("/driverHistory", authdriver, getDriverRides);

// Fellow driver management routes
router.use("/fellow-drivers", fellowDriverRoutes);

module.exports = router;
