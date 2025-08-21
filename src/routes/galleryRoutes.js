const express = require("express");
const { body } = require("express-validator");
const {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
} = require("../controllers/galleryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Validation rules for gallery item creation/update
const galleryValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Title cannot be more than 100 characters"),
  body("imageUrl")
    .trim()
    .notEmpty()
    .withMessage("Image URL is required")
    .isURL()
    .withMessage("Please provide a valid image URL"),
  body("size")
    .trim()
    .isIn(["square", "landscape"])
    .withMessage("Size must be either 'square' or 'landscape'"),
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
router.put("/reorder", protect, authorize("admin"), reorderGalleryItems);

// Public routes
router.get("/", getGalleryItems);
router.get("/:id", getGalleryItem);

// Protected routes (Admin only)
router.post(
  "/",
  protect,
  authorize("admin"),
  galleryValidation,
  createGalleryItem
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  galleryValidation,
  updateGalleryItem
);
router.delete("/:id", protect, authorize("admin"), deleteGalleryItem);

module.exports = router;
