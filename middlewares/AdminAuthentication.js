const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { StatusCodes } = require("http-status-codes");

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Access denied. Invalid token format." 
      });
    }

    // Verify token
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Check if it's an admin token
    if (payload.type !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        success: false,
        message: "Access denied. Admin privileges required." 
      });
    }

    // Find admin in database
    const admin = await Admin.findById(payload.id);

    if (!admin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Access denied. Admin not found." 
      });
    }

    if (!admin.isActive) {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        success: false,
        message: "Access denied. Admin account is deactivated." 
      });
    }

    // Attach admin info to request
    req.admin = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      fullName: admin.fullName
    };

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Access denied. Invalid token." 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Access denied. Token expired." 
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      message: "Internal server error during authentication." 
    });
  }
};

// Middleware to check specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Authentication required." 
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check if admin has the required permission
    if (!req.admin.permissions.includes(permission)) {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        success: false,
        message: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};

// Middleware to check if admin has any of the specified permissions
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Authentication required." 
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check if admin has any of the required permissions
    const hasPermission = permissions.some(permission => 
      req.admin.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        success: false,
        message: `Access denied. Required permissions: ${permissions.join(' or ')}` 
      });
    }

    next();
  };
};

module.exports = {
  authAdmin,
  requirePermission,
  requireAnyPermission
};
