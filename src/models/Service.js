const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      trim: true,
      uppercase: true,
      maxlength: [50, "Category name cannot be more than 50 characters"],
    },
    price: {
      type: Number,
      required: false,
      min: [0, "Price cannot be negative"],
    },
    icon: {
      type: String,
      required: [true, "Service icon is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for ordering services within categories
serviceSchema.index({ category: 1, order: 1, isActive: 1 });

module.exports = mongoose.model("Service", serviceSchema);
