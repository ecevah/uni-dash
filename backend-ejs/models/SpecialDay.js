const mongoose = require("mongoose");

const specialDaySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])$/.test(v);
        },
        message: (props) =>
          `${props.value} geçerli bir tarih formatı değil! (DD-MM)`,
      },
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: (props) => `${props.value} geçerli bir HEX renk kodu değil!`,
      },
    },
  },
  {
    timestamps: true,
  }
);

const SpecialDay = mongoose.model("SpecialDay", specialDaySchema);
module.exports = SpecialDay;
