const Testimonial = require("../models/Testimonial");
const { validationResult } = require("express-validator");

// @desc    Get all testimonials
// @route   GET /api/v1/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const filter = includeInactive === "true" ? {} : { isActive: true };

    const testimonials = await Testimonial.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching testimonials",
      error: error.message,
    });
  }
};

// @desc    Get single testimonial
// @route   GET /api/v1/testimonials/:id
// @access  Public
const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching testimonial",
      error: error.message,
    });
  }
};

// @desc    Create new testimonial
// @route   POST /api/v1/testimonials
// @access  Private (Admin only)
const createTestimonial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    const testimonialData = {
      ...req.body,
    };

    // Set createdBy if user is authenticated (not environment admin)
    if (req.user && req.user.id !== "admin_user") {
      testimonialData.createdBy = req.user.id;
    }

    const testimonial = await Testimonial.create(testimonialData);

    res.status(201).json({
      success: true,
      data: testimonial,
      message: "Testimonial created successfully",
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating testimonial",
      error: error.message,
    });
  }
};

// @desc    Update testimonial
// @route   PUT /api/v1/testimonials/:id
// @access  Private (Admin only)
const updateTestimonial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    let testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const updateData = {
      ...req.body,
    };

    // Set updatedBy if user is authenticated (not environment admin)
    if (req.user && req.user.id !== "admin_user") {
      updateData.updatedBy = req.user.id;
    }

    testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: testimonial,
      message: "Testimonial updated successfully",
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating testimonial",
      error: error.message,
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/v1/testimonials/:id
// @access  Private (Admin only)
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting testimonial",
      error: error.message,
    });
  }
};

// @desc    Reorder testimonials
// @route   PUT /api/v1/testimonials/reorder
// @access  Private (Admin only)
const reorderTestimonials = async (req, res) => {
  try {
    const { testimonialIds } = req.body;

    if (!Array.isArray(testimonialIds)) {
      return res.status(400).json({
        success: false,
        message: "Testimonial IDs must be an array",
      });
    }

    // Update order for each testimonial
    const updatePromises = testimonialIds.map((testimonialId, index) =>
      Testimonial.findByIdAndUpdate(testimonialId, { order: index })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Testimonials reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reordering testimonials",
      error: error.message,
    });
  }
};

module.exports = {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
};
