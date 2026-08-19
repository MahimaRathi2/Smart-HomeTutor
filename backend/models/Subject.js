const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["CBSE", "ICSE", "IB / IGCSE", "State Board", "Competitive Test Prep", "General"],
      default: "CBSE",
    },
    grade: {
      type: String,
      required: true,
      trim: true,
      default: "Class 1 to 12",
    },
    description: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate subject + category combinations
subjectSchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);
