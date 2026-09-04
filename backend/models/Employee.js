const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    department: {
      type: String,
      default: "",
    },

    position: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    joiningDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// A user can have only one employee profile per team
employeeSchema.index(
  { team: 1, user: 1 },
  { unique: true }
);

module.exports = mongoose.model("Employee", employeeSchema);