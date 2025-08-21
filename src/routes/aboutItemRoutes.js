const express = require("express");
const {
  getCategories,
  getAboutItems,
  getAboutItem,
  createAboutItem,
  updateAboutItem,
  deleteAboutItem,
  reorderAboutItems,
} = require("../controllers/aboutItemController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const router = express.Router();

router
  .route("/")
  .get(getAboutItems)
  .post(
    protect,
    authorize("admin"),
    [
      body("title").notEmpty().withMessage("Title is required"),
      body("category")
        .isLength({ min: 1, max: 50 })
        .withMessage("Category must be between 1 and 50 characters"),
      body("icon").notEmpty().withMessage("Icon is required"),
    ],
    createAboutItem
  );

// Categories route - using different path to avoid conflicts
router.route("/list/categories").get(getCategories);

// Reorder route must come before /:id route
router.route("/reorder").put(protect, authorize("admin"), reorderAboutItems);

router
  .route("/:id")
  .get(getAboutItem)
  .put(
    protect,
    authorize("admin"),
    [
      body("title").optional().notEmpty().withMessage("Title cannot be empty"),
      body("category")
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage("Category must be between 1 and 50 characters"),
      body("icon").optional().notEmpty().withMessage("Icon cannot be empty"),
    ],
    updateAboutItem
  )
  .delete(protect, authorize("admin"), deleteAboutItem);

module.exports = router;
