const { validationResult } = require("express-validator");
const Service = require("../models/Service");

// @desc    Get all available service categories
// @route   GET /api/v1/services/list/categories
// @access  Public
const getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.distinct("category");
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.sort(),
    });
  } catch (error) {
    console.error("Error fetching service categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching service categories",
      error: error.message,
    });
  }
};

// @desc    Get all services
// @route   GET /api/v1/services
// @access  Public
const getServices = async (req, res) => {
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

    const services = await Service.find(filter)
      .sort({ category: 1, order: 1, createdAt: 1 })
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching services",
      error: error.message,
    });
  }
};

// @desc    Get single service
// @route   GET /api/v1/services/:id
// @access  Public
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching service",
      error: error.message,
    });
  }
};

// @desc    Create new service
// @route   POST /api/v1/services
// @access  Private (Admin only)
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    const serviceData = {
      ...req.body,
    };

    // Set createdBy if user is authenticated (not environment admin)
    if (req.user && req.user.id !== "admin_user") {
      serviceData.createdBy = req.user.id;
    }

    const service = await Service.create(serviceData);

    res.status(201).json({
      success: true,
      data: service,
      message: "Service created successfully",
    });
  } catch (error) {
    console.error("Error creating service:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating service",
      error: error.message,
    });
  }
};

// @desc    Update service
// @route   PUT /api/v1/services/:id
// @access  Private (Admin only)
const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const updateData = {
      ...req.body,
    };

    // Set updatedBy if user is authenticated (not environment admin)
    if (req.user && req.user.id !== "admin_user") {
      updateData.updatedBy = req.user.id;
    }

    service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: service,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Error updating service:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating service",
      error: error.message,
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/v1/services/:id
// @access  Private (Admin only)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting service",
      error: error.message,
    });
  }
};

// @desc    Reorder services
// @route   PUT /api/v1/services/reorder
// @access  Private (Admin only)
const reorderServices = async (req, res) => {
  try {
    const { serviceIds, category } = req.body;

    if (!Array.isArray(serviceIds)) {
      return res.status(400).json({
        success: false,
        message: "Service IDs must be an array",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required for reordering",
      });
    }

    // Update order for each service in the specified category
    const updatePromises = serviceIds.map((serviceId, index) =>
      Service.findByIdAndUpdate(serviceId, { order: index })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Services in ${category} category reordered successfully`,
    });
  } catch (error) {
    console.error("Error reordering services:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reordering services",
      error: error.message,
    });
  }
};

module.exports = {
  getServiceCategories,
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  reorderServices,
};
