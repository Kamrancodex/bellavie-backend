const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: [true, "Testimonial quote is required"],
      trim: true,
      maxlength: [1000, "Quote cannot be more than 1000 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [100, "Author name cannot be more than 100 characters"],
    },
    role: {
      type: String,
      required: [true, "Role/event type is required"],
      trim: true,
      maxlength: [100, "Role cannot be more than 100 characters"],
    },
    event: {
      type: String,
      required: [true, "Event date is required"],
      trim: true,
      maxlength: [50, "Event date cannot be more than 50 characters"],
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

module.exports = mongoose.model("Testimonial", TestimonialSchema);
