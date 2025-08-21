const AboutItem = require("../models/AboutItem");
const { validationResult } = require("express-validator");

// @desc    Get all available categories
// @route   GET /api/v1/about-items/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await AboutItem.distinct("category");
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.sort(),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: error.message,
    });
  }
};

// @desc    Get all about items
// @route   GET /api/v1/about-items
// @access  Public
const getAboutItems = async (req, res) => {
  try {
    const { includeInactive = false, category } = req.query;

    let filter = {};

    // Filter by active status
    if (includeInactive !== "true") {
      filter.isActive = true;
    }

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    const aboutItems = await AboutItem.find(filter)
      .sort({ category: 1, order: 1, createdAt: 1 })
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    res.status(200).json({
      success: true,
      count: aboutItems.length,
      data: aboutItems,
    });
  } catch (error) {
    console.error("Error fetching about items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching about items",
      error: error.message,
    });
  }
};

// @desc    Get single about item
// @route   GET /api/v1/about-items/:id
// @access  Public
const getAboutItem = async (req, res) => {
  try {
    const aboutItem = await AboutItem.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    if (!aboutItem) {
      return res.status(404).json({
        success: false,
        message: "About item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: aboutItem,
    });
  } catch (error) {
    console.error("Error fetching about item:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching about item",
      error: error.message,
    });
  }
};

// @desc    Create new about item
// @route   POST /api/v1/about-items
// @access  Private (Admin only)
const createAboutItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    const aboutItemData = {
      ...req.body,
    };

    // Set createdBy if user is authenticated (not environment admin)
    if (req.user && req.user.id !== "admin_user") {
      aboutItemData.createdBy = req.user.id;
    }

    const aboutItem = await AboutItem.create(aboutItemData);

    res.status(201).json({
      success: true,
      data: aboutItem,
      message: "About item created successfully",
    });
  } catch (error) {
    console.error("Error creating about item:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating about item",
      error: error.message,
    });
  }
};

// @desc    Update about item
// @route   PUT /api/v1/about-items/:id
// @access  Private (Admin only)
const updateAboutItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    let aboutItem = await AboutItem.findById(req.params.id);

    if (!aboutItem) {
      return res.status(404).json({
        success: false,
        message: "About item not found",
      });
    }

    const updateData = {
      ...req.body,
    };

    // Set updatedBy if user is authenticated (not environment admin)
    if (req.user && req.user.id !== "admin_user") {
      updateData.updatedBy = req.user.id;
    }

    aboutItem = await AboutItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: aboutItem,
      message: "About item updated successfully",
    });
  } catch (error) {
    console.error("Error updating about item:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating about item",
      error: error.message,
    });
  }
};

// @desc    Delete about item
// @route   DELETE /api/v1/about-items/:id
// @access  Private (Admin only)
const deleteAboutItem = async (req, res) => {
  try {
    const aboutItem = await AboutItem.findById(req.params.id);

    if (!aboutItem) {
      return res.status(404).json({
        success: false,
        message: "About item not found",
      });
    }

    await AboutItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "About item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting about item:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting about item",
      error: error.message,
    });
  }
};

// @desc    Reorder about items within a category
// @route   PUT /api/v1/about-items/reorder
// @access  Private (Admin only)
const reorderAboutItems = async (req, res) => {
  try {
    const { aboutItemIds, category } = req.body;

    if (!Array.isArray(aboutItemIds)) {
      return res.status(400).json({
        success: false,
        message: "About item IDs must be an array",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required for reordering",
      });
    }

    // Update order for each about item in the specified category
    const updatePromises = aboutItemIds.map((aboutItemId, index) =>
      AboutItem.findByIdAndUpdate(aboutItemId, { order: index })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `About items in ${category} category reordered successfully`,
    });
  } catch (error) {
    console.error("Error reordering about items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reordering about items",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getAboutItems,
  getAboutItem,
  createAboutItem,
  updateAboutItem,
  deleteAboutItem,
  reorderAboutItems,
};
