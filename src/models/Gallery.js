const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    size: {
      type: String,
      required: [true, "Image size is required"],
      enum: {
        values: ["square", "landscape"],
        message: "Size must be either square or landscape",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
gallerySchema.index({ order: 1, isActive: 1 });

// Pre-save middleware to handle order assignment
gallerySchema.pre("save", async function (next) {
  if (this.isNew && this.order === 0) {
    try {
      const maxOrder = await this.constructor
        .findOne({}, { order: 1 })
        .sort({ order: -1 })
        .lean();
      this.order = maxOrder ? maxOrder.order + 1 : 0;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to reorder gallery items
gallerySchema.statics.reorderItems = async function (itemIds) {
  const bulkOps = itemIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { order: index },
    },
  }));

  return this.bulkWrite(bulkOps);
};

const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;
