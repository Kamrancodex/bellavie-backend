const express = require("express");
const { body } = require("express-validator");
const {
  getServiceCategories,
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  reorderServices,
} = require("../controllers/serviceController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

console.log("Service routes loaded - getServiceCategories function:", typeof getServiceCategories);

// IMPORTANT: Categories route MUST be first, before any /:id routes
router.get("/categories", (req, res) => {
  console.log("Categories route hit in serviceRoutes!");
  getServiceCategories(req, res);
});

// Validation rules for service creation/update
const serviceValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Description must be between 1 and 500 characters"),
  body("category")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Category must be between 1 and 50 characters"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("icon").trim().isLength({ min: 1 }).withMessage("Icon is required"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
];

// Reorder route must come before /:id route
router.put("/reorder", protect, authorize("admin"), reorderServices);

// Public routes  
router.get("/", getServices);
router.get("/:id", getService);

// Protected routes (Admin only)
router.post("/", protect, authorize("admin"), serviceValidation, createService);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  serviceValidation,
  updateService
);
router.delete("/:id", protect, authorize("admin"), deleteService);

module.exports = router;
