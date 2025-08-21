const express = require("express");
const {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} = require("../controllers/testimonialController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const router = express.Router();

// Reorder route must come before /:id route
router.route("/reorder").put(protect, authorize("admin"), reorderTestimonials);

router
  .route("/")
  .get(getTestimonials)
  .post(
    protect,
    authorize("admin"),
    [
      body("quote").notEmpty().withMessage("Quote is required"),
      body("author").notEmpty().withMessage("Author is required"),
      body("role").notEmpty().withMessage("Role is required"),
      body("event").notEmpty().withMessage("Event is required"),
    ],
    createTestimonial
  );

router
  .route("/:id")
  .get(getTestimonial)
  .put(
    protect,
    authorize("admin"),
    [
      body("quote").optional().notEmpty().withMessage("Quote cannot be empty"),
      body("author")
        .optional()
        .notEmpty()
        .withMessage("Author cannot be empty"),
      body("role").optional().notEmpty().withMessage("Role cannot be empty"),
      body("event").optional().notEmpty().withMessage("Event cannot be empty"),
    ],
    updateTestimonial
  )
  .delete(protect, authorize("admin"), deleteTestimonial);

module.exports = router;
