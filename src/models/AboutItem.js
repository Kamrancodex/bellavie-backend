const mongoose = require("mongoose");

const AboutItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "About item title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      uppercase: true,
      maxlength: [50, "Category name cannot be more than 50 characters"],
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
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
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: false,
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for category and order
AboutItemSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model("AboutItem", AboutItemSchema);
