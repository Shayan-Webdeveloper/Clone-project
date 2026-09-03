const mongoose = require("mongoose");

const schedulerLogSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
     timestamps: true 
}
);

module.exports = mongoose.model("SchedulerLog", schedulerLogSchema);

