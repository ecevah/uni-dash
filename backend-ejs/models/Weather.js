const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      default: "İzmir",
    },
  },
  {
    timestamps: true,
  }
);

const Weather = mongoose.model("Weather", weatherSchema);
module.exports = Weather;
