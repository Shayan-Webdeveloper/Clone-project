const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportDate: {
      type: Date,
      required: true,
    },

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },

        answer: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

reportSchema.index(
  { employee: 1, reportDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("Report", reportSchema);