const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["like", "dislike"],
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
