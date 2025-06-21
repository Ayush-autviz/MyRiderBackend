const { StatusCodes } = require("http-status-codes");
const CommissionSettings = require("../models/CommissionSettings");

// Get current commission setting
const getCommissionSettings = async (req, res) => {
  try {
    const commissionSetting = await CommissionSettings.getCurrentRate();
    await commissionSetting.populate(
      "lastUpdatedBy",
      "firstName lastName username"
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Commission settings retrieved successfully",
      data: commissionSetting,
    });
  } catch (error) {
    console.error("Error fetching commission settings:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch commission settings",
      error: error.message,
    });
  }
};

// Update commission setting
const updateCommissionSetting = async (req, res) => {
  try {
    const { commissionPercentage, description } = req.body;

    // Validate commission percentage
    if (commissionPercentage < 0 || commissionPercentage > 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Commission percentage must be between 0 and 100",
      });
    }

    // Get current setting or create if doesn't exist
    let commissionSetting = await CommissionSettings.findOne({
      isActive: true,
    });

    if (!commissionSetting) {
      commissionSetting = new CommissionSettings({
        commissionPercentage,
        description: description || "Global commission rate for all rides",
        lastUpdatedBy: req.admin.id,
        isActive: true,
      });
    } else {
      commissionSetting.commissionPercentage = commissionPercentage;
      if (description !== undefined)
        commissionSetting.description = description;
      commissionSetting.lastUpdatedBy = req.admin.id;
    }

    await commissionSetting.save();
    await commissionSetting.populate(
      "lastUpdatedBy",
      "firstName lastName username"
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Commission setting updated successfully",
      data: commissionSetting,
    });
  } catch (error) {
    console.error("Error updating commission setting:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update commission setting",
      error: error.message,
    });
  }
};

// Initialize default commission setting
const initializeDefaultCommission = async (req, res) => {
  try {
    // Check if commission setting already exists
    const existingSetting = await CommissionSettings.findOne({
      isActive: true,
    });

    if (existingSetting) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Commission setting already exists",
        data: existingSetting,
      });
    }

    // Create default commission setting
    const commissionSetting = await CommissionSettings.create({
      commissionPercentage: 20,
      description: "Default global commission rate",
      lastUpdatedBy: req.admin.id,
      isActive: true,
    });

    await commissionSetting.populate(
      "lastUpdatedBy",
      "firstName lastName username"
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Default commission setting initialized successfully",
      data: commissionSetting,
    });
  } catch (error) {
    console.error("Error initializing commission setting:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to initialize commission setting",
      error: error.message,
    });
  }
};

module.exports = {
  getCommissionSettings,
  updateCommissionSetting,
  initializeDefaultCommission,
};
