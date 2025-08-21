const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// Environment-based admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    }
  );
};

// @desc    Login user (environment-based for single admin)
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;

    // Debug logging (remove in production)
    console.log('Login attempt:', {
      provided: { username, password: password ? '[PROVIDED]' : '[MISSING]' },
      expected: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD ? '[SET]' : '[MISSING]' }
    });

    // Check environment-based admin credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create admin user object (not stored in database)
      const adminUser = {
        id: "admin_user",
        username: ADMIN_USERNAME,
        role: "admin",
        email: "admin@bellavie.com",
        firstName: "Admin",
        lastName: "User",
      };

      // Generate tokens
      const token = generateToken(adminUser.id);
      const refreshToken = generateRefreshToken(adminUser.id);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: {
            username: adminUser.username,
            role: adminUser.role,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
          },
          token,
        },
        message: "Login successful",
      });
    } else {
      console.log('Credentials mismatch - username match:', username === ADMIN_USERNAME, 'password match:', password === ADMIN_PASSWORD);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Register user (for future multi-user support)
// @route   POST /api/v1/auth/register
// @access  Public (disabled for now)
const register = async (req, res) => {
  res.status(403).json({
    success: false,
    message:
      "Registration is currently disabled. This is a single-admin system.",
  });
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // For environment-based admin
    if (req.user.id === "admin_user") {
      return res.status(200).json({
        success: true,
        data: {
          username: ADMIN_USERNAME,
          role: "admin",
          email: "admin@bellavie.com",
          firstName: "Admin",
          lastName: "User",
        },
      });
    }

    // For database users (future implementation)
    const user = await User.findById(req.user.id).select(
      "-password -refreshTokens"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    // Environment-based admin cannot update profile
    if (req.user.id === "admin_user") {
      return res.status(403).json({
        success: false,
        message:
          "Admin profile cannot be updated. Please use environment variables.",
      });
    }

    // For database users (future implementation)
    const { firstName, lastName, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select(
      "-password -refreshTokens"
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    // Environment-based admin cannot change password
    if (req.user.id === "admin_user") {
      return res.status(403).json({
        success: false,
        message:
          "Admin password cannot be changed. Please use environment variables.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();

    // Clear refresh tokens to force re-login
    user.refreshTokens = [];

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // For environment-based admin
    if (decoded.id === "admin_user") {
      const newToken = generateToken("admin_user");

      return res.status(200).json({
        success: true,
        data: { token: newToken },
        message: "Token refreshed successfully",
      });
    }

    // For database users (future implementation)
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: { token: newToken },
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// @desc    Forgot password (for future database users)
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  res.status(403).json({
    success: false,
    message:
      "Password reset is not available for the admin account. Please use environment variables.",
  });
};

// @desc    Reset password (for future database users)
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  res.status(403).json({
    success: false,
    message:
      "Password reset is not available for the admin account. Please use environment variables.",
  });
};

module.exports = {
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
};
