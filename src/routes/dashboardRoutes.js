const express = require("express");
const { query } = require("express-validator");
const {
  getDashboardStats,
  getRecentActivity,
  getAnalytics,
  getPerformanceMetrics,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const {
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Validation rules
const dateRangeValidation = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Valid start date is required"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Valid end date is required"),
  query("period")
    .optional()
    .isIn(["7d", "30d", "90d", "1y"])
    .withMessage("Invalid period"),
];

// All routes require authentication
router.use(protect);

// Routes
router.get("/stats", getDashboardStats);
router.get("/recent-activity", getRecentActivity);
router.get(
  "/analytics",
  dateRangeValidation,
  handleValidationErrors,
  getAnalytics
);
router.get("/performance", getPerformanceMetrics);

module.exports = router;
