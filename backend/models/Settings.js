const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "standup",
      unique: true,
    },

    // 24-hour "HH:mm" time the standup email goes out on active days, e.g. "09:00"
    dailyTime: {
      type: String,
      default: "09:00",
    },

    // Which weekdays the standup questions are sent on, like an alarm app.
    days: {
      sunday: { type: Boolean, default: true },
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
    },

    timezone: {
      type: String,
      default: "Asia/Karachi",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
