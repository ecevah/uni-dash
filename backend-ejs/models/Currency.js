const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    usdRate: {
      type: Number,
      required: true,
    },
    usdChange: {
      type: Number,
      required: true,
    },
    eurRate: {
      type: Number,
      required: true,
    },
    eurChange: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Currency = mongoose.model("Currency", currencySchema);
module.exports = Currency;
