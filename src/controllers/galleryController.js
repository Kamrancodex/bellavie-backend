const Gallery = require("../models/Gallery");

// @desc    Get all gallery items
// @route   GET /api/v1/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
  try {
    const { includeInactive = false, size } = req.query;

    let filter = {};
    if (includeInactive !== "true") {
      filter.isActive = true;
    }
    if (size && ["square", "landscape"].includes(size)) {
      filter.size = size;
    }

    const galleryItems = await Gallery.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    res.status(200).json({
      success: true,
      count: galleryItems.length,
      data: galleryItems,
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching gallery items",
      error: error.message,
    });
  }
};

// @desc    Get single gallery item
// @route   GET /api/v1/gallery/:id
// @access  Public
const getGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: galleryItem,
    });
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while fetching gallery item",
      error: error.message,
    });
  }
};

// @desc    Create new gallery item
// @route   POST /api/v1/gallery
// @access  Private/Admin
const createGalleryItem = async (req, res) => {
  try {
    const { title, imageUrl, size, isActive, order } = req.body;

    const galleryItem = await Gallery.create({
      title,
      imageUrl,
      size,
      isActive: isActive !== undefined ? isActive : true,
      order: order !== undefined ? order : 0,
      createdBy: req.user ? req.user._id : null,
      updatedBy: req.user ? req.user._id : null,
    });

    const populatedItem = await Gallery.findById(galleryItem._id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    res.status(201).json({
      success: true,
      data: populatedItem,
      message: "Gallery item created successfully",
    });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating gallery item",
      error: error.message,
    });
  }
};

// @desc    Update gallery item
// @route   PUT /api/v1/gallery/:id
// @access  Private/Admin
const updateGalleryItem = async (req, res) => {
  try {
    const { title, imageUrl, size, isActive, order } = req.body;

    let galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    // Update fields
    galleryItem.title = title !== undefined ? title : galleryItem.title;
    galleryItem.imageUrl =
      imageUrl !== undefined ? imageUrl : galleryItem.imageUrl;
    galleryItem.size = size !== undefined ? size : galleryItem.size;
    galleryItem.isActive =
      isActive !== undefined ? isActive : galleryItem.isActive;
    galleryItem.order = order !== undefined ? order : galleryItem.order;
    galleryItem.updatedBy = req.user ? req.user._id : galleryItem.updatedBy;

    await galleryItem.save();

    const populatedItem = await Gallery.findById(galleryItem._id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    res.status(200).json({
      success: true,
      data: populatedItem,
      message: "Gallery item updated successfully",
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating gallery item",
      error: error.message,
    });
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/v1/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting gallery item",
      error: error.message,
    });
  }
};

// @desc    Reorder gallery items
// @route   PUT /api/v1/gallery/reorder
// @access  Private/Admin
const reorderGalleryItems = async (req, res) => {
  try {
    const { galleryItemIds } = req.body;

    if (!Array.isArray(galleryItemIds) || galleryItemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Gallery item IDs array is required",
      });
    }

    // Verify all items exist
    const existingItems = await Gallery.find({
      _id: { $in: galleryItemIds },
    });

    if (existingItems.length !== galleryItemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more gallery items not found",
      });
    }

    // Reorder items
    await Gallery.reorderItems(galleryItemIds);

    res.status(200).json({
      success: true,
      message: "Gallery items reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reordering gallery items",
      error: error.message,
    });
  }
};

module.exports = {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
};
