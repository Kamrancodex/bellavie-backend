const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Validation rules
const createUserValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["admin", "manager", "staff"])
    .withMessage("Role must be admin, manager, or staff"),
];

const updateUserValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email address"),
  body("role")
    .optional()
    .isIn(["admin", "manager", "staff"])
    .withMessage("Role must be admin, manager, or staff"),
];

const getUserValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];

const getUsersQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("role")
    .optional()
    .isIn(["admin", "manager", "staff"])
    .withMessage("Role must be admin, manager, or staff"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// All routes require authentication
router.use(protect);

// Routes
router.get(
  "/",
  getUsersQueryValidation,
  handleValidationErrors,
  adminOnly,
  getUsers
);
router.get("/stats", adminOnly, getUserStats);
router.get(
  "/:id",
  getUserValidation,
  handleValidationErrors,
  adminOnly,
  getUser
);
router.post(
  "/",
  createUserValidation,
  handleValidationErrors,
  adminOnly,
  createUser
);
router.put(
  "/:id",
  updateUserValidation,
  handleValidationErrors,
  adminOnly,
  updateUser
);
router.delete(
  "/:id",
  getUserValidation,
  handleValidationErrors,
  adminOnly,
  deleteUser
);

module.exports = router;
