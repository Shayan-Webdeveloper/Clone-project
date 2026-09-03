const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Report = require("../models/Report");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Answers are required",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const existingReport = await Report.findOne({
      employee: req.user.id,
      date: today,
    });

    if (existingReport) {
      return res.status(409).json({
        message: "You have already submitted today's report",
      });
    }

    const report = await Report.create({
      employee: req.user.id,
      date: today,
      answers,
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("Report submission error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;